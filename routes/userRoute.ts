import User from '../controllers/user'
import auth from '../middleware/authentication'
export const userRoute = require('express').Router()

userRoute.post("/login", User.login)
userRoute.post("/register", User.register)

// authentication
userRoute.use(auth)

userRoute.get("/", User.getUserInfo)
userRoute.patch("/reward", User.reward)
userRoute.patch("/pokeball/increase", User.pokeballIncrease)
userRoute.patch("/pokeball/decrease", User.pokeballDecrease)
