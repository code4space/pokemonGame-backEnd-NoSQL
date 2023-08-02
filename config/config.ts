import { dbName } from "../constant/constant";
require('../model/type');
require('../model/pokemon');
require('../model/user');

const mongoose = require('mongoose');

const mongoURI: string = process.env.MONGODB_URI + dbName;

export async function connectToDatabase(): Promise<void> {
    try {

        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('connected to MongoDB');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export function getMongoClient() {
    return mongoose;
}
