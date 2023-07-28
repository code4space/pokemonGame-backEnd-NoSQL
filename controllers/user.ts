import handleError from '../helper/error'

export default class User {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body
            if (!username) throw handleError('Unauthorized', 'Username is required!')
            if (!password) throw handleError('Unauthorized', 'Password is required!')

            
        } catch (error) {
            next(error)
        }
    }
}