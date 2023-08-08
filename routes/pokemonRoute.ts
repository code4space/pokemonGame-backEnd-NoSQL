import Pokemon from "../controllers/pokemon"
import auth from "../middleware/authentication"
export const pokemonRoute = require('express').Router()

// authentication
pokemonRoute.use(auth)

// pokemonRoute.get('/', Pokemon.getMyCollection)
pokemonRoute.get('/', Pokemon.getMyCollection)
pokemonRoute.post('/', Pokemon.addOneToCollection)
pokemonRoute.delete('/:id', Pokemon.deleteOneFromCollection)
pokemonRoute.patch('/levelup', Pokemon.pokemonLevelUp)
pokemonRoute.patch('/evolve/:id', Pokemon.evolve)
pokemonRoute.get('/draw', Pokemon.getOnePokemon)
pokemonRoute.post('/gacha', Pokemon.gacha)
pokemonRoute.patch('/skip', Pokemon.skip)
pokemonRoute.get('/enemies/:difficulty', Pokemon.getEnemies)