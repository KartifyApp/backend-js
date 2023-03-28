import { BcryptService } from './externalService.js'
import { UserService } from './userService.js'

export class ConstraintService {
    static async uniqueUserUsername(username) {
        const user = await UserService.getUserByUsername(username)
        if (user) {
            throw Error(`User with username ${username} already exists.`)
        }
        return user
    }

    static async checkPassword(username, password) {
        const user = await UserService.getUserByUsername(username)
        if (!user) {
            throw Error(`Invalid username ${username}`)
        }
        if (!(await BcryptService.compare(password, user.password))) {
            throw Error(`Invalid password for username ${username}`)
        }
        delete user.password
        return user
    }
}
