import { pokemonRoute } from "./pokemonRoute"
import { userRoute } from "./userRoute"
export const route = require('express').Router()

route.use('/user', userRoute)
route.use('/pokemon', pokemonRoute)