import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { JWT_EXPIRE_TIME, JWT_SECRET, SALT_ROUNDS } from '../constants.js'

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

export class BcryptService {
    static async hash(password) {
        try {
            const salt = await bcrypt.genSalt(SALT_ROUNDS)
            return await bcrypt.hash(password, salt)
        } catch (error) {
            throw Error(`Password hashing failed.`)
        }
    }

    static async compare(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword)
        } catch (error) {
            throw Error(`Error comparing passwords.`)
        }
    }
}
