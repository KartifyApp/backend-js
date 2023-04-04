import { client } from '../models/db.js'
import { UtilityService } from '../services/utilityService.js'
import { BcryptClient } from './externalClient.js'

export class UserClient {
    static async getUserById(userId) {
        try {
            const user = await client.query(`SELECT * FROM users WHERE user_id = '${userId}'`)
            return user.rowCount > 0 ? UtilityService.camelCaseObject(user.rows[0]) : null
        } catch (error) {
            throw Error(`Error fetching user with userId ${userId}.`)
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
        try {
            const createdUser = await client.query(
                `INSERT INTO users (name, email, username, password, user_address, user_type) 
                VALUES ('${user.name}', '${user.email}', '${user.username}', '${user.password}', '${JSON.stringify(user.userAddress)}', '${user.userType}')
                RETURNING user_id, name, email, username, user_address, user_type`
            )
            return createdUser.rowCount > 0 ? UtilityService.camelCaseObject(createdUser.rows[0]) : null
        } catch (error) {
            throw Error(`Error creating user with username ${user.username}.`)
        }
    }

    static async updateUser(user) {
        try {
            const updatedUser = await client.query(
                `UPDATE users SET name = '${user.name}', email = '${user.email}', username = '${user.username}', password = '${user.password}', 
                user_address = '${JSON.stringify(user.userAddress)}' WHERE user_id = '${user.userId}' RETURNING user_id, name, email, username, user_address, user_type`
            )
            return updatedUser.rowCount > 0 ? UtilityService.camelCaseObject(updatedUser.rows[0]) : null
        } catch (error) {
            throw Error(`Error updating user with userId ${user.userId}.`)
        }
    }
}
