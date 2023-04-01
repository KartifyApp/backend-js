import { BcryptClient } from '../clients/externalClient.js'
import { UserClient } from '../clients/userClient.js'

export class UserService {
    static async uniqueUserUsername(username) {
        const user = await UserClient.getUserByUsername(username)
        if (user) {
            throw Error(`User with username ${username} already exists.`)
        }
        return true
    }

    static async checkPassword(username, password) {
        const user = await UserClient.getUserByUsername(username)
        if (!user) {
            throw Error(`Invalid username ${username}`)
        }
        if (!(await BcryptClient.compare(password, user.password))) {
            throw Error(`Invalid password for username ${username}`)
        }
        delete user.password
        return user
    }
}
