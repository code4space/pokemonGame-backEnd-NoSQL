import handleError from "../helper/error"
import { verifyToken } from "../helper/jwt"
import { Users } from "../model/user"


export default async function auth(req, res, next) {
    try {
        const accessToken = req.headers.access_token
        if (!accessToken) {
            throw handleError('Unauthorized', 'Access Denied')
        } else {
            let payload = verifyToken(accessToken)
            let user = await Users.findById(payload.id)
            if (!user) {
                throw handleError('Unauthorized', 'Access Denied')
            } else {
                req.user = {
                    id: user.id
                }
                next()
            }
        }
    } catch (error) {
        next(error)
    }
}