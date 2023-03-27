import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../constants.js'

import { client } from '../models/db.js'
import { UtilityService } from './utilityService.js'

export class UserService {
    static async getUserById(user_id) {
        try {
            const user = await client.query(`SELECT * FROM users WHERE user_id = '${user_id}'`)
            return user.rowCount > 0 ? UtilityService.camelCaseObject(user.rows[0]) : null
        } catch (error) {
            throw Error(`Error fetching user with user_id ${user_id}.`)
        }
    }

    static async getUserByUsername(username) {
        try {
            const user = await client.query(`SELECT * FROM users WHERE username = '${username}'`)
            return user.rowCount > 0 ? UtilityService.camelCaseObject(user.rows[0]) : null
        } catch (error) {
            throw Error(`Error fetching user with username ${username}.`)
        }
    }

    static async createUser(user) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const hashedPassword = await bcrypt.hash(user.password, salt)
        try {
            await client.query(`
                INSERT INTO users (name, email, username, password, user_address, user_type) 
                VALUES ('${user.name}', '${user.email}', '${user.username}', '${hashedPassword}', '${JSON.stringify(user.address)}', '${user.userType}')
            `)
            return true
        } catch (error) {
            throw Error(`Error creating user with username ${user.username}.`)
        }
    }

    static async checkPassword(username, password) {
        const user = await UserService.getUserByUsername(username)
        if (!user) {
            throw Error(`Invalid username ${username}`)
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw Error(`Invalid password for username ${username}`)
        }
        return user
    }
}
