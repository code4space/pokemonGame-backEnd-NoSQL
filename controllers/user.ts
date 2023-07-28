import { comparePassword } from '../helper/bcrypt'
import handleError from '../helper/error'
import { getToken } from '../helper/jwt'
import { Users } from '../model/user'

export default class User {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body
            if (!username) throw handleError('Unauthorized', 'Username is required!')
            if (!password) throw handleError('Unauthorized', 'Password is required!')

            const user = await Users.findOne({ username })
            if (!user || !comparePassword(password, user.password)) {
                throw handleError('Not Found', 'Invalid Username or Password!')
            }

            const payload = { id: user.id };
            const access_token = getToken(payload)

            return res.status(200).json({access_token})
        } catch (error) {
            next(error)
        }
    }
}