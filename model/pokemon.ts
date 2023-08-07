const mongoose = require('mongoose');

// const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    hp: {
        type: Number,
        required: true,
    },
    attack: {
        type: Number,
        required: true,
    },
    def: {
        type: Number,
        required: true,
    },
    baseExp: {
        type: Number,
        required: true,
    },
    power: {
        type: Number,
        required: true,
    },
    img1: {
        type: String,
        required: true,
    },
    img2: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    frontView: {
        type: String,
        required: true,
    },
    backView: {
        type: String,
        required: true,
    },
    type: [
        {
            type: String,
            required: true,
        }
    ],
    pokedex: {
        type: Number,
        required: true,
    },
    evolves_pokedex: {
        type: Number,
        default: null
    },
    evolves_name: {
        type: String,
        default: null
    },
});

export const Pokemons = mongoose.model('Pokemons', schema);