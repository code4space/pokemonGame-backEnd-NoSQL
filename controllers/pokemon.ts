import axios from "axios";
import { Users } from "../model/user"
import { Pokemons } from "../model/pokemon"
import handleError from "../helper/error";

// @ts-ignore
import { Types } from "../model/type"
// @ts-ignore
import { elementWeakness } from "../helper/element";

export default class Pokemon {
    static async getMyCollection(req, res, next) {
        try {
            // const page = req.query.page ? Number(req.query.page) : 1;
            // const sort = req.query.sort;
            // const limit = 50;
            // const offset = (page - 1) * limit;

            // const userPokemon = await Users.findOne({
            //     _id: req.user.id,
            //     pokemons: {
            //         $elemMatch: {
            //             pokemon: { $in: await Pokemons.find({}, { __v: 0 }) },
            //         },
            //     },
            // }, { __v: 0 }).populate('pokemons.pokemon');

            // const pokemon = userPokemon.pokemons.map((el) => {
            // const { id, name, hp, attack, def, baseExp, power, img1, img2, summary, frontView, backView, type } = el.pokemon;
            // const types = elementWeakness(type);
            // const level = el.level - 1;


            // return {
            //     id, name,
            //     hp: hp + Math.floor((5 / 100) * hp) * level,
            //     attack: attack + Math.floor((5 / 100) * attack) * level,
            //     def: def + Math.floor((5 / 100) * def) * level,
            //     baseExp,
            //     power: power + Math.floor((5 / 100) * power) * level,
            //     img1,img2,summary,frontView,backView,level,type: types,
            // };
            //     return el.pokemon    
            // })

            // const type = await Types.find()
            const pokemonWithType = await Pokemons.find({ _id: '64c4cae126cd17c784c90a68' }).populate('type');
            return res.status(200).json({ pokemonWithType })
        } catch (error) {
            console.log(error)
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

            const { stats, base_experience, sprites } = detailPokemon;
            const baseStatSum = stats.reduce((sum, stat) => sum + stat.base_stat, 0);
            const additionalPower = (base_experience) => base_experience * 0.1;

            const pokemon = {
                name: detailPokemon.name,
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
            };


            res.status(200).json({ pokemon })
        } catch (error) {
            next(error)
        }
    }

    static async addOneToCollection(req, res, next) {
        try {
            const { name, attack, hp, def, baseExp, power, img1, img2, summary, frontView, backView, type, } = req.body;

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

            let pokemon = await Pokemons.findOne({ name }, { '__v': 0 })
            if (!pokemon) pokemon = await Pokemons.create({ name, attack, hp, def, baseExp, power, img1, img2, summary, frontView, backView, type })
            console.log('find or create pokemon done')

            const userPokemon = await Users.findOne({
                _id: req.user.id,
                pokemons: {
                    $elemMatch: {
                        pokemon: { $in: await Pokemons.findOne({ name }) },
                    },
                },
            }, { __v: 0 }).populate('pokemons.pokemon');

            if (userPokemon) {
                await Users.update({
                    _id: req.user.id,
                    pokemons: {
                        $elemMatch: {
                            pokemon: { $in: await Pokemons.findOne({ name }) },
                        },
                    },
                }, { $inc: { 'pokemons.$.level': 5 } }, { new: true });
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
            console.log('masuk vbg')
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
}