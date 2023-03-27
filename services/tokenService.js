import jwt from 'jsonwebtoken'

import { JWT_EXPIRE_TIME, JWT_SECRET } from '../constants.js'

export class TokenService {
    static generateToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, {
            expiresIn: JWT_EXPIRE_TIME
        })
    }

    static decodeToken(token) {
        return jwt.verify(token, JWT_SECRET)
    }

    static destroyToken(token) {
        jwt.destroy(token)
    }
}
