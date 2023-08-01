import { dbName } from "../constant/constant";
import { hashPassword } from "../helper/bcrypt";
import { Pokemons } from "../model/pokemon";
import { Types } from "../model/type";
import { Users } from "../model/user";

const fs = require('fs');
const mongoose = require('mongoose');

// Connect to your MongoDB database
mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// @ts-ignore
async function getDataAndSeed(fileName: string, model: any): Promise<void> {
    const rawData = fs.readFileSync(`./seeders/${fileName}.json`);
    const data: object = JSON.parse(rawData);

    await model.deleteMany({})
    await model.insertMany(data)
}

// @ts-ignore
function getData(fileName: string): Array<any> {
    const rawData = fs.readFileSync(`./seeders/${fileName}.json`);
    return JSON.parse(rawData);
}

// @ts-ignore
async function seed(data: object | Array<any>, model: any): Promise<void> {
    await model.deleteMany({})
    await model.insertMany(data)
}

// Function to seed the database
async function seedDatabase() {
    try {
        await getDataAndSeed('pokemon', Pokemons)
        const userData = getData('user').map(el => {
            el.password = hashPassword(el.password)
            return el
        })
        await getDataAndSeed('type', Types)
        await seed(userData, Users)

        console.log('seeding complete')
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();
