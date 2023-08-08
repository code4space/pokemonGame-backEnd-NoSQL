import { comparePassword, hashPassword } from '../helper/bcrypt'
import handleError from '../helper/error'
import { getToken } from '../helper/jwt'
import { Users } from '../model/user'
import mongoose from 'mongoose'

interface listBallType {
    ball: string;
    increase: number;
}

export default class User {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body
            if (!username) throw handleError('Unauthorized', 'Username is required!')
            if (!password) throw handleError('Unauthorized', 'Password is required!')

            const user = await Users.findOne({ username })
            if (!user || !comparePassword(password, user.password)) {
                throw handleError('Not Found', 'Invalid Username or Password!')
            }

            const payload = { id: user.id };
            const access_token = getToken(payload)

            res.status(200).json({ access_token })
        } catch (error) {
            next(error)
        }
    }

    static async register(req, res, next) {
        try {
            const { username, password } = req.body
            if (!username) throw handleError('Bad Request', 'Username is required!')
            if (!password) throw handleError('Bad Request', 'Password is required!')

            await Users.create({
                username,
                password: hashPassword(password),
                draw: 10,
                balls: {
                    pokeball: 7,
                    greatball: 4,
                    ultraball: 2,
                    masterball: 1
                },
                gacha: 24
            }).catch(error => {
                if (error.code === 11000) throw handleError('Conflict', `Player with Username ${username} already exist`)
            })

            res.status(201).json({ message: `Player with username ${username} has been created` })
        } catch (error) {
            next(error)
        }
    }

    static async getUserInfo(req, res, next) {
        try {
            const { gacha, balls, draw, username } = await Users.findById(req.user.id, { 'balls._id': 0 })

            res.status(201).json({ data: { gacha, balls, draw, username } })
        } catch (error) {
            next(error)
        }
    }

    static async pokeballIncrease(req, res, next) {
        try {
            const { balls }: { balls: object } = await Users.findById(req.user.id)
            // const { listBall }: {listBall:listBallType[]} = req.body;
            const listBall: listBallType[] = [
                { ball: 'pokeball', increase: 5 },
                { ball: 'greatball', increase: 3 },
                { ball: 'ultraball', increase: 1 },
                { ball: 'masterball', increase: 0 }
            ]

            let newBalls: object = balls
            console.log(newBalls)
            for (let i = 0; i < listBall.length; i++) {
                newBalls[listBall[i].ball] =
                    newBalls[listBall[i].ball] + listBall[i].increase;
            }

            await Users.updateOne(
                { _id: req.user.id },
                { $set: { 'balls': newBalls } }
            );

            res.status(200).json({ message: `pokeball increase success` })
        } catch (error) {
            next(error)
        }
    }

    static async pokeballDecrease(req, res, next) {
        try {
            const { balls }: { balls: object } = await Users.findById(req.user.id)
            const { ballType }: { ballType: string } = req.body;

            let newBalls: object = balls
            if (newBalls[ballType] < 1) throw handleError('Forbidden', `Your ${ballType} already run out`)
            newBalls[ballType] -= 1

            await Users.updateOne(
                { _id: req.user.id },
                { $set: { 'balls': newBalls } }
            )

            res.status(200).json({ message: `pokeball decrease success` })
        } catch (error) {
            next(error)
        }
    }

    static async drawIncrease(req, res, next) {
        try {
            const { draw }: { draw: number } = await Users.findById(req.user.id)
            await Users.updateOne(
                { _id: req.user.id },
                { $set: { 'draw': draw + parseInt(req.params.amount) } }
            )
            res.status(200).json({ message: `pokeball decrease success` })
        } catch (error) {
            next(error)
        }
    }

    static async reward(req, res, next) {
        const session = await mongoose.startSession()
        session.startTransaction();
        try {
            //? lvl up
            const { pokemonId, upLevel, drawAmount }: { pokemonId: Array<any>, upLevel: number, drawAmount: number } = req.body;
            if (!pokemonId) throw handleError('Bad Request', "pokemonID required!")
            if (!upLevel) throw handleError('Bad Request', "upLevel required!")
            if (!drawAmount) throw handleError('Bad Request', "drawAmount required!")

            const user = await Users.findById(req.user.id).session(session);

            for (let i = 0; i < pokemonId.length; i++) {
                const targetPokemonIndex = user.pokemons.findIndex(
                    (pokemon) => pokemon.pokemon.toString() === pokemonId[i]
                );

                if (targetPokemonIndex === -1) {
                    throw handleError('Bad Request', "Pokemon didn't found")
                }

                const userPokemon = user.pokemons[targetPokemonIndex]

                if (userPokemon.level < (userPokemon.star * 30)) userPokemon.level += upLevel; 
            }

            //? get ball and draw chance
            const { listBall }: { listBall: listBallType[] } = req.body;

            for (let i = 0; i < listBall.length; i++) {
                user.balls[listBall[i].ball] += listBall[i].increase;
            }

            user.draw += drawAmount
            
            await user.save();

            res.status(200).json({ message: 'Reward claimed' })
            await session.commitTransaction();
        } catch (error) {
            console.log(error)
            await session.abortTransaction();
            next(error)
        } finally {
            session.endSession();
        }
    }
}