import { BcryptClient } from '../clients/externalClient.js'
import { TableNames } from '../models/enumConstants.js'
import { DBService } from './DBService.js'

export class UserService {
    static async getUserById(userId) {
        const user = await DBService.getData(TableNames.USER, { userId: userId })
        if (user.length === 0) {
            throw Error(`No user with ID ${userId} exists.`)
        }
        delete user[0].password
        return user[0]
    }

    static async uniqueUserUsername(username) {
        const users = await DBService.getData(TableNames.USER, { username: username })
        if (users.length > 0) {
            throw Error(`User with username ${username} already exists.`)
        }
        return true
    }

    static async checkPassword(username, password) {
        const users = await DBService.getData(TableNames.USER, { username: username })
        if (users.length === 0) {
            throw Error(`Invalid username ${username}`)
        }
        if (!(await BcryptClient.compare(password, users[0].password))) {
            throw Error(`Invalid password for username ${username}`)
        }
        delete users[0].password
        return users[0]
    }
}
