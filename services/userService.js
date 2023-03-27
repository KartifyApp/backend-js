import { client } from '../models/db.js'

export class UserService {
    static async getUserById(user_id) {
        try {
            const user = await client.query(`SELECT * FROM users WHERE user_id = '${user_id}'`)
            return user.rowCount > 0 ? user.rows[0] : null
        } catch (error) {
            throw Error(`Error fetching user with user_id ${user_id}.`)
        }
    }
}
