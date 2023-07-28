import Pokemon from "../controllers/pokemon"
import auth from "../middleware/authentication"
export const pokemonRoute = require('express').Router()

// authentication
pokemonRoute.use(auth)

pokemonRoute.get('/', Pokemon.getPokemon)
