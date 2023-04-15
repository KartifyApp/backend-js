import { PlatformStatus, TableNames } from '../models/enumConstants.js'
import { DBService } from './DBService.js'

export class PlatformService {
    static async uniquePlatformName(name) {
        const platforms = await DBService.getData(TableNames.PLATFORM, { name: name })
        if (platforms.length > 0) {
            throw Error(`Platform with name ${name} already exists.`)
        }
        return true
    }

    static async getPlatformById(platformId) {
        const platforms = await DBService.getData(TableNames.PLATFORM, { platformId: platformId })
        if (platforms.length === 0) {
            throw Error(`No platform with platformId ${platformId} exists.`)
        }
        return platforms[0]
    }

    static async getUserPlatform(userId, platformId) {
        const platforms = await DBService.getData(TableNames.PLATFORM, { platformId: platformId, userId: userId })
        if (platforms.length === 0) {
            throw Error(`No platform with platformId ${platformId} exists for userId ${userId}.`)
        }
        return platforms[0]
    }
}

export class PlatformReviewService {
    static async getUserPlatformReview(userId, platformReviewId) {
        const platformReviews = await DBService.getData(TableNames.PLATFORM_REVIEW, {
            userId: userId,
            platformReviewId: platformReviewId
        })
        if (platformReviews.length === 0) {
            throw Error(`No platform review with platformReviewId ${platformReviewId} exists for userId ${userId}.`)
        }
        return platformReviews[0]
    }
}
