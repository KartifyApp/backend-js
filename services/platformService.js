import { PlatformClient, PlatformReviewClient } from '../clients/platformClient.js'
import { TableNames } from '../models/enumConstants.js'
import { DBService } from './DBService.js'

export class PlatformService {
    static async uniquePlatformName(name) {
        const platforms = await DBService.getData(TableNames.PLATFORM, { name: name })
        if (platforms.length > 0) {
            throw Error(`Platform with name ${name} already exists.`)
        }
        return true
    }

    static async checkUserPlatform(userId, platformId) {
        const platforms = await DBService.getData(TableNames.PLATFORM, { platformId: platformId, userId: userId })
        if (platforms.length === 0) {
            throw Error(`No platform with platformId ${platformId} exists for userId ${userId}.`)
        }
        return platforms[0]
    }
}

export class PlatformReviewService {
    static async checkUserPlatformReview(userId, platformId, platformReviewId) {
        const platformReviews = await DBService.getData(TableNames.PLATFORM_REVIEW, {
            userId: userId,
            platformId: platformId,
            platformReviewId: platformReviewId
        })
        if (platformReviews.length === 0) {
            throw Error(`No platform review with platformReviewId ${platformReviewId} exists for userId ${userId} and platformId ${platformId}.`)
        }
        return platformReviews[0]
    }
}
