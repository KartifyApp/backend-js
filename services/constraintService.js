import { BcryptService } from './externalService.js'
import { PlatformService } from './platformService.js'
import { UserService } from './userService.js'

export class ConstraintService {
    static async uniqueUserUsername(username) {
        const user = await UserService.getUserByUsername(username)
        if (user) {
            throw Error(`User with username ${username} already exists.`)
        }
        return true
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

    static async uniquePlatformName(name) {
        const platform = await PlatformService.getPlatformByName(name)
        if (platform) {
            throw Error(`Platform with name ${name} already exists.`)
        }
        return true
    }

    static async checkUserPlatform(userId, platformId) {
        const platforms = await PlatformService.getUserPlatforms(userId, platformId)
        if (platforms.length === 0) {
            throw Error(`No platform ${req.params.platformId} exists for user ${req.user.userId}.`)
        }
        return platforms[0]
    }
}
