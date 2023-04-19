import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { JWT_EXPIRE_TIME, JWT_SECRET, SALT_ROUNDS } from '../constants.js'

export class UtilityService {
    static getValues(hardKeys, softKeys, obj) {
        var objCreated = {}
        hardKeys.forEach((key) => {
            if (!obj[key]) {
                throw Error(`${key} not provided.`)
            }
            objCreated[key] = obj[key]
        })
        softKeys.forEach(([key, value]) => {
            if (obj[key]) objCreated[key] = obj[key]
            else objCreated[key] = value
        })
        return objCreated
    }

    static getUpdateValues(keys, oldObj, newObj) {
        var updateObj = {}
        keys.forEach((key) => {
            if (newObj[key] && oldObj[key] != newObj[key]) {
                updateObj[key] = newObj[key]
            }
        })
        return updateObj
    }

    static generateToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, {
            expiresIn: JWT_EXPIRE_TIME
        })
    }

    static decodeToken(token) {
        return jwt.verify(token, JWT_SECRET)
    }

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
