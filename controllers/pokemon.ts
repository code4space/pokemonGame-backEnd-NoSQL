import axios from "axios";
import mongoose from "mongoose";
import { Users } from "../model/user"
import { Pokemons } from "../model/pokemon"
import { Types } from "../model/type"
import { elementWeakness } from "../helper/element";
import handleError from "../helper/error";
import drawPokemon from "../helper/drawPokemon";

function additionalStat(stat: number, level: number) {
    return Math.floor((5 / 100) * stat) * level
}

export default class Pokemon {

    static async getMyCollection(req, res, next) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const sort = req.query.sort;
            const limit = 40;
            const skipDocuments = (page - 1) * limit;

            const mongoose = require('mongoose')
            const pipeline: Array<any> = [
                {
                    $match: { _id: new mongoose.Types.ObjectId(req.user.id) }
                },
                {
                    $project: {
                        _id: 0,
                        username: 1,
                        password: 1,
                        draw: 1,
                        balls: 1,
                        gacha: 1,
                        star: 1,
                        pokemons: { $slice: ['$pokemons', skipDocuments, limit] }
                    }
                },
                {
                    $unwind: "$pokemons"
                },
                {
                    $lookup: {
                        from: "pokemons",
                        localField: "pokemons.pokemon",
                        foreignField: "_id",
                        as: "pokemons.pokemonData"
                    }
                },
                {
                    $unwind: "$pokemons.pokemonData"
                },
                sort === 'true' ? { $sort: { "pokemons.pokemonData.baseExp": -1 } } : { $sort: { "pokemons.pokemonData._id": -1 } },
                {
                    $group: {
                        _id: "$_id",
                        username: { $first: "$username" },
                        password: { $first: "$password" },
                        draw: { $first: "$draw" },
                        balls: { $first: "$balls" },
                        gacha: { $first: "$gacha" },
                        pokemons: { $push: "$pokemons" }
                    }
                }
            ]
            const userPokemon = await Users.aggregate(pipeline);

            const userPokemonCount = await Users.findById(req.user.id).select('pokemons')
            if (!userPokemon.length) return res.status(200).json({ pokemon: [], totalPokemon: 0, page: 1 })
            const pokemon = userPokemon[0].pokemons.map(async (el) => {
                const { id, name, hp, attack, def, baseExp, power, img1, img2, summary, frontView, backView, type, pokedex, evolves_pokedex, evolves_name } = el.pokemonData;
                console.log(evolves_name)
                const typesRaw = await Types.find({ name: { $in: type } }, { _id: 0, __v: 0 })
                const types = elementWeakness(typesRaw)
                const level = el.level;

                return {
                    id, name,
                    hp: hp + additionalStat(hp, level),
                    attack: attack + additionalStat(attack, level),
                    def: def + additionalStat(def, level),
                    baseExp,
                    power: Math.floor(power + additionalStat(power, level)),
                    img1, img2, summary, frontView, backView, level, type: types, pokedex, evolves_pokedex,
                    star: el.star, evolves_name,
                    base_stat: {hp, attack, def}
                };
            })
            Promise.all(pokemon)
                .then(pokemon => {
                    return res.status(200).json({ pokemon, totalPokemon: userPokemonCount.pokemons.length, page });
                })

        } catch (error) {
            next(error)
        }
    }

    static async getEnemies(req, res, next) {
        try {
            const { difficulty } = req.params

            //? Find the highest level pokemon that user has
            const user = await Users.findById(
                req.user.id, { pokemons: 1 },
            ).populate('pokemons.pokemon', 'level')
            user.pokemons.sort((a, b) => b.level - a.level);
            const highestLevelPokemon: number = user.pokemons[0].level;

            //? Find all pokemon in the db
            let pokemon = await Pokemons.find({}, { __v: 0 });
            pokemon = await Promise.all(pokemon.map(async (el) => {
                const { id, name, hp, attack, def, baseExp, power, frontView, backView, type } = el
                const typeRaw = await Types.find({ name: { $in: type } }, { _id: 0, __v: 0 });
                const types = elementWeakness(typeRaw);
                return { id, name, hp, attack, def, baseExp, power, frontView, backView, type: types };
            }));

            //? Choose 3 random pokemon
            let enemies: Array<any> = [], temp: Array<number> = []
            for (let i = 0; i < 3; i++) {
                const random = (): number => Math.floor(Math.random() * pokemon.length)
                const pickOneNumber = random()
                const level = difficulty === 'true' ? Math.ceil(Math.random() * (highestLevelPokemon + 6)) + Math.floor(highestLevelPokemon / 2) : Math.ceil(Math.random() * (highestLevelPokemon + 3))
                if (temp.some(el => el === pickOneNumber)) {
                    i--
                    continue
                }
                else enemies.push({ ...pokemon[pickOneNumber], level })
                enemies[i].hp += additionalStat(enemies[i].hp, level)
                temp.push(pickOneNumber)
            }


            return res.status(200).json({ pokemon: enemies })
        } catch (error) {
            next(error)
        }
    }

    static async skip(req, res, next) {
        try {
            const { draw } = await Users.findById(req.user.id)

            if (!draw) {
                return res.status(200).json({ message: "Draw chance is needed!" });
            }

            //? Find suitable pokemon
            const fetchFunction = async () => {
                const random = Math.ceil(Math.random() * 1280);

                const getPokemon = await axios({
                    method: "GET",
                    url: `https://pokeapi.co/api/v2/pokemon?limit=1&offset=${random}`
                })
                const randomPokemon = getPokemon.data.results[0];
                const { data: pokemonData } = await axios.get(randomPokemon.url);

                if (
                    pokemonData.base_experience === null ||
                    pokemonData.sprites.other.dream_world.front_default === null
                ) {
                    return fetchFunction();
                }

                return random;
            };

            const data = await fetchFunction();
            await Users.updateOne({ _id: req.user.id }, { $set: { gacha: data }, $inc: { draw: -1 } });

            res.status(200).json({ message: "Draw used" })
        } catch (error) {
            next(error)
        }
    }

    static async getOnePokemon(req, res, next) {
        try {
            const user = await Users.findById(req.user.id)
            const pokemonFromGacha = await axios({
                method: 'GET',
                url: `https://pokeapi.co/api/v2/pokemon?limit=1&offset=${user.gacha}`
            }).then(value => value.data.results[0]);

            const detailPokemon = await axios({
                method: 'GET',
                url: pokemonFromGacha['url']
            }).then((value) => value.data)

            // Get summary
            let detailSpecies = await axios.get(detailPokemon.species.url);
            const allSummary: Array<any> = detailSpecies.data.flavor_text_entries;
            let enSummary: string = ''
            for (let i = 0; i < allSummary.length; i++) {
                if (allSummary[i].language.name === "en") {
                    enSummary = allSummary[i].flavor_text.replace(/\\n|\\f/g, " ").replace(/\n|\f/g, " ");
                    break;
                }
            }

            const type: Array<string> = detailPokemon.types.map(el => el.type.name);

            const { name, stats, base_experience, sprites, id: pokedex } = detailPokemon;
            const baseStatSum = stats.reduce((sum, stat) => sum + stat.base_stat, 0);
            const additionalPower = (base_experience) => base_experience * 0.1;

            function findTheNextEvolution(data, name: string) {
                if (data.species.name === name) {
                    if (data.evolves_to.length) {
                        let evolve = data.evolves_to[0].species
                        return { pokedex: evolve.url.split('/')[6], name: evolve.name }
                    } else {
                        return null
                    }
                } else {
                    if (data.evolves_to.length) {
                        for (const evolution of data.evolves_to) {
                            return findTheNextEvolution(evolution, name)
                        }
                    }
                }
            }

            // Find the evolution
            const evolves = await axios({
                method: "GET",
                url: `https://pokeapi.co/api/v2/pokemon-species/${pokedex}`
            }).then(async (value) => {
                return await axios({
                    method: 'GET',
                    url: value.data.evolution_chain.url
                }).then(value => {
                    const isEvolving = value.data.chain
                    return findTheNextEvolution(isEvolving, name)
                })
            })


            const pokemon = {
                name: name,
                attack: stats[1].base_stat,
                hp: stats[0].base_stat,
                def: stats[2].base_stat,
                baseExp: base_experience,
                power: base_experience + baseStatSum + additionalPower(base_experience),
                img1: sprites.other.dream_world.front_default,
                img2: sprites.other["official-artwork"].front_default,
                summary: enSummary,
                frontView: sprites.front_default,
                backView: sprites.back_default,
                type,
                pokedex,
                evolves_pokedex: evolves?.pokedex,
                evolves_name: evolves?.name,
            };

            res.status(200).json({ pokemon })
        } catch (error) {
            next(error)
        }
    }

    static async addOneToCollection(req, res, next) {
        try {
            const { name, attack, hp, def, baseExp, power, img1, img2, summary, frontView, backView, type, pokedex, evolves_pokedex, evolves_name } = req.body;

            if (!name) throw handleError('Bad Request', 'name is required!')
            else if (!attack) throw handleError('Bad Request', 'attack is required!');
            else if (!hp) throw handleError('Bad Request', 'hp is required!');
            else if (!def) throw handleError('Bad Request', 'def is required!');
            else if (!baseExp) throw handleError('Bad Request', 'baseExp is required!');
            else if (!power) throw handleError('Bad Request', 'power is required!');
            else if (!img1) throw handleError('Bad Request', 'img1 is required!');
            else if (!img2) throw handleError('Bad Request', 'img2 is required!');
            else if (!summary) throw handleError('Bad Request', 'summary is required!');
            else if (!frontView) throw handleError('Bad Request', 'frontView is required!');
            else if (!backView) throw handleError('Bad Request', 'backView is required!');
            else if (!type) throw handleError('Bad Request', 'type is required!');
            else if (!pokedex) throw handleError('Bad Request', 'pokedex is required!');

            let pokemon = await Pokemons.findOne({ name }, { '__v': 0 })
            if (!pokemon) pokemon = await Pokemons.create({ name, attack, hp, def, baseExp, power, img1, img2, summary, frontView, backView, type, pokedex, evolves_pokedex: evolves_pokedex ?? null, evolves_name: evolves_name ?? null })

            const userPokemon = await Users.findOne({
                _id: req.user.id,
                pokemons: {
                    $elemMatch: {
                        pokemon: { $in: await Pokemons.findOne({ name }) },
                    },
                },
            }, { __v: 0 }).populate('pokemons.pokemon');

            if (userPokemon) {
                await Users.updateOne({
                    _id: req.user.id,
                    pokemons: {
                        $elemMatch: {
                            pokemon: { $in: await Pokemons.findOne({ name }) },
                        },
                    },
                }, { $inc: { 'pokemons.$.level': 5 } });
                res.status(200).json({ message: `Your Pokémon with the name ${name} has been leveled up by 5.` })
            } else {
                const user = await Users.findById(req.user.id)
                user.pokemons.push({ pokemon: pokemon._id })
                user.save()
                res.status(201).json({ message: `Success add Pokemon with name ${name} to your collection` })
            }
        } catch (error) {
            next(error)
        }
    }

    static async deleteOneFromCollection(req, res, next) {
        try {
            await Users.updateOne(
                { _id: req.user.id },
                { $pull: { pokemons: { pokemon: req.params.id } } }
            );
            res.status(200).json({ message: "Success Delete Pokemon" });
        } catch (error) {
            next(error)
        }
    }

    static async pokemonLevelUp(req, res, next) {
        try {
            const { pokemonId, upLevel }: { pokemonId: Array<any>, upLevel: number } = req.body;
            if (!pokemonId) throw handleError('Bad Request', "pokemonID required!")
            if (!upLevel) throw handleError('Bad Request', "upLevel required!")


            for (let i = 0; i < pokemonId.length; i++) {
                await Users.updateOne({
                    _id: req.user.id,
                    pokemons: {
                        $elemMatch: {
                            pokemon: { $in: await Pokemons.findOne({ _id: pokemonId[i] }) },
                        },
                    },
                }, { $inc: { 'pokemons.$.level': upLevel } }, { new: true });
            }

            res.status(200).json({
                message: `Pokemon with id ${pokemonId.join(",")} success Lvl up`,
            });
        } catch (error) {
            next(error)
        }
    }

    static async gacha(req, res, next) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            //? ball decrease
            const { ballType, baseExp }: { ballType: "masterball" | "pokeball" | "greatball" | 'ultraball', baseExp: number } = req.body;
            const type = `balls.${ballType}`
            const user = await Users.findById(req.user.id, { [type]: 1 })

            if (!user.balls[ballType]) throw handleError('Forbidden', `Your ${ballType} already run out`)
            await Users.updateOne(
                { _id: req.user.id },
                { $inc: { [type]: -1 } },
                { session }
            )

            // skip
            async function skip() {
                const { draw } = await Users.findById(req.user.id)

                if (!draw) {
                    return res.status(200).json({ message: "Draw chance is needed!" });
                }

                //? Find suitable pokemon
                const fetchFunction = async () => {
                    const random = Math.ceil(Math.random() * 1280);

                    const getPokemon = await axios({
                        method: "GET",
                        url: `https://pokeapi.co/api/v2/pokemon?limit=1&offset=${random}`
                    })
                    const randomPokemon = getPokemon.data.results[0];
                    const { data: pokemonData } = await axios.get(randomPokemon.url);

                    if (
                        pokemonData.base_experience === null ||
                        pokemonData.sprites.other.dream_world.front_default === null
                    ) {
                        return fetchFunction();
                    }

                    return random;
                };

                const data = await fetchFunction();
                await Users.updateOne(
                    { _id: req.user.id },
                    { $set: { gacha: data }, $inc: { draw: -1 } },
                    { session });
            }

            //? get pokemon
            if (drawPokemon(ballType, baseExp)) {
                const { name, attack, hp, def, baseExp, power, img1, img2, summary, frontView, backView, type, pokedex, evolves_pokedex, evolves_name } = req.body;

                if (!name) throw handleError('Bad Request', 'name is required!')
                else if (!attack) throw handleError('Bad Request', 'attack is required!');
                else if (!hp) throw handleError('Bad Request', 'hp is required!');
                else if (!def) throw handleError('Bad Request', 'def is required!');
                else if (!baseExp) throw handleError('Bad Request', 'baseExp is required!');
                else if (!power) throw handleError('Bad Request', 'power is required!');
                else if (!img1) throw handleError('Bad Request', 'img1 is required!');
                else if (!img2) throw handleError('Bad Request', 'img2 is required!');
                else if (!summary) throw handleError('Bad Request', 'summary is required!');
                else if (!frontView) throw handleError('Bad Request', 'frontView is required!');
                else if (!backView) throw handleError('Bad Request', 'backView is required!');
                else if (!type) throw handleError('Bad Request', 'type is required!');
                else if (!pokedex) throw handleError('Bad Request', 'pokedex is required!');

                let pokemon = await Pokemons.findOne({ name }, { '__v': 0 })
                if (!pokemon) pokemon = await Pokemons.create({ name, attack, hp, def, baseExp, power, img1, img2, summary, frontView, backView, type, pokedex, evolves_pokedex: evolves_pokedex ?? null, evolves_name: evolves_name ?? null })

                const userPokemon = await Users.findOne({
                    _id: req.user.id,
                    pokemons: {
                        $elemMatch: {
                            pokemon: { $in: await Pokemons.findOne({ name }) },
                        },
                    },
                }, { __v: 0 }).populate('pokemons.pokemon');

                if (userPokemon) {
                    await Users.updateOne(
                        {
                            _id: req.user.id,
                            pokemons: {
                                $elemMatch: {
                                    pokemon: { $in: await Pokemons.findOne({ name }) },
                                },
                            },
                        },
                        { $inc: { 'pokemons.$.level': 5 } },
                        { session });
                    await skip()
                    res.status(200).json({ message: `Your ${name} has been leveled up by 5.`, status: true },)
                } else {
                    const user = await Users.findById(req.user.id).session(session);
                    user.pokemons.push({ pokemon: pokemon._id });
                    user.save();
                    await skip();
                    res.status(201).json({ message: `Success add ${name} to your collection`, status: true });
                }

            } else res.status(200).json({ message: 'Failed to get pokemon', status: false })

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction()
            next(error)
        } finally {
            session.endSession()
        }
    }
}
