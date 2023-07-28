import { comparePassword, hashPassword } from '../helper/bcrypt'
import handleError from '../helper/error'
import { getToken } from '../helper/jwt'
import { Users } from '../model/user'

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

            return res.status(200).json({ access_token })
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

            return res.status(201).json({ message: `Player with username ${username} has been created` })
        } catch (error) {
            next(error)
        }
    }

    static async getUserInfo(req, res, next) {
        try {
            const { gacha, balls, draw } = await Users.findById(req.user.id, { 'balls._id': 0 })

            return res.status(201).json({ data: { gacha, balls, draw } })
        } catch (error) {
            next(error)
        }
    }

    static async pokeballIncrease(req, res, next) {
        interface listBallType {
            ball: string;
            increase: number;
        }

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
            console.log(newBalls)

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
                { $set: {'draw': draw + parseInt(req.params.amount)} }
            )
            res.status(200).json({ message: `pokeball decrease success` })
        } catch (error) {
            next(error)
        }
    }
}