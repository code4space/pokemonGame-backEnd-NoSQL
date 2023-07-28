const jwt = require('jsonwebtoken');
const KONCI = process.env.JWT_KEY

export function getToken (payload) {
    return jwt.sign(payload, KONCI)
}

export function verifyToken (token) {
    return jwt.verify(token, KONCI)
}