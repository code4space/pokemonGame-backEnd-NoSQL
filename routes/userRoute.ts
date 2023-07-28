export const userRoute = require('express').Router()
import User from '../controllers/user'

userRoute.post("/login", User.login)