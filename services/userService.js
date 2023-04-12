import { BcryptClient } from '../clients/externalClient.js'
import { TableNames, UserType } from '../models/enumConstants.js'
import { DBService } from './DBService.js'
import { PlatformService } from './platformService.js'

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

export class DeliveryJobService {
    static async getDeliveryJobById(deliveryJobId) {
        const deliveryJob = await DBService.getData(TableNames.DELIVERY_JOB, { deliveryJobId })
        if (deliveryJob.length === 0) {
            throw Error(`No delivery job with ID ${deliveryJobId} exists.`)
        }
        return deliveryJob[0]
    }

    static async uniqueDeliveryJob(userId, platformId) {
        const deliveryJob = await DBService.getData(TableNames.DELIVERY_JOB, { userId, platformId })
        if (deliveryJob.length > 0) {
            throw Error(`Delivery job with User ID ${userId} and Platform ID ${platformId} already exists.`)
        }
        return true
    }

    static async getDeliveryUser(userId) {
        const user = await DBService.getData(TableNames.USER, { userId, userType: UserType.DELIVERY })
        if (user.length === 0) {
            throw Error(`No Delivery User with ID ${userId} exists.`)
        }
        return user[0]
    }

    static async getUserDeliveryJob(user, deliveryJobId) {
        if (user.userType == UserType.PROVIDER) {
            const deliveryJob = await DeliveryJobService.getDeliveryJobById(deliveryJobId)
            await PlatformService.getUserPlatform(user.userId, deliveryJob.platformId)
            return deliveryJob
        } else {
            const deliveryJob = await DBService.getData(TableNames.DELIVERY_JOB, { userId: user.userId, deliveryJobId })
            if (deliveryJob.length === 0) {
                throw Error(`No delivery job with ID ${deliveryJobId} exists for User ID ${user.userId}.`)
            }
            return deliveryJob[0]
        }
    }
}
