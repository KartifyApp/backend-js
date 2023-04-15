import { DeliveryStatus, OrderStatus, TableNames, UserType } from '../models/enumConstants.js'
import { DBService } from './DBService.js'
import { PlatformService } from './platformService.js'

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

    static async getUserDeliveryJob(userId, deliveryJobId) {
        const deliveryJob = await DBService.getData(TableNames.DELIVERY_JOB, { userId, deliveryJobId })
        if (deliveryJob.length === 0) {
            throw Error(`No delivery job with ID ${deliveryJobId} exists for User ID ${userId}.`)
        }
        return deliveryJob[0]
    }

    static async getDeliveryJobByUser(user, deliveryJobId) {
        const deliveryJob =
            user.userType == UserType.DELIVERY
                ? await DeliveryJobService.getUserDeliveryJob(user.userId, deliveryJobId)
                : await DeliveryJobService.getDeliveryJobById(deliveryJobId)
        if (user.userType == UserType.PROVIDER) {
            await PlatformService.getUserPlatform(user.userId, deliveryJob.platformId)
        }
        return deliveryJob
    }

    static async getUniqueDeliveryJob(userId, platformId) {
        const deliveryJob = await DBService.getData(TableNames.DELIVERY_JOB, { userId, platformId })
        if (deliveryJob.length == 0) {
            throw Error(`No delivery job for user ID ${userId} exists in platform ID ${platformId}.`)
        }
        return deliveryJob[0]
    }

    static async updateDeliveryJobStatus(userId, platformId, orderStatus) {
        const deliveryJob = await DeliveryJobService.getUniqueDeliveryJob(userId, platformId)
        if (orderStatus == OrderStatus.PICKUP || orderStatus == OrderStatus.TAKE) {
            if (deliveryJob.deliveryStatus != DeliveryStatus.ACTIVE) {
                throw Error(`Cannot update from delivery status ${deliveryJob.deliveryStatus}.`)
            }
            return await DBService.updateData(TableNames.DELIVERY_JOB, { deliveryStatus: DeliveryStatus.WORKING })
        }
        if (orderStatus == OrderStatus.SHIPPED || orderStatus == OrderStatus.RETURNED) {
            return await DBService.updateData(TableNames.DELIVERY_JOB, { deliveryStatus: DeliveryStatus.ACTIVE })
        }
    }
}
