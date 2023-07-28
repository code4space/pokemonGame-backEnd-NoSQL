const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    weakness: {
        type: [String],
        required: true,
    },
    strength: {
        type: [String],
        required: true,
    },
    immune: {
        type: [String],
        required: true,
    },
});

export const Types = mongoose.model('Types', schema);