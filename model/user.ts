const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ballsSchema = new mongoose.Schema({
    pokeball: { type: Number, required: true },
    greatball: { type: Number, required: true },
    ultraball: { type: Number, required: true },
    masterball: { type: Number, required: true },
});



const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    draw: {
        type: Number,
        required: true,
    },
    balls: {
        type: ballsSchema,
        required: true,
    },
    gacha: {
        type: Number,
        required: true,
    },
    pokemons: [{
        pokemon: { type: Schema.Types.ObjectId, ref: 'Pokemons' },
        level: { type: Number, default: 1 }
    }]
});

export const Users = mongoose.model('Users', schema);