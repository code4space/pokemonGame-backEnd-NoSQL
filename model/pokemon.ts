const mongoose = require('mongoose');

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
            ref: 'Types'
        }
    ],
});

export const Pokemons = mongoose.model('Pokemons', schema);