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
        const platforms = await DBService.getData(TableNames.PLATFORM, { platformId: platformId })
        if (platforms.length === 0) {
            throw Error(`No platform with platformId ${platformId} exists.`)
        }
        if (platforms[0].userId != userId) {
            throw Error(`Platform with platformId ${platformId} doesn't belong to user with userId ${userId}.`)
        }
        return platforms[0]
    }
}

export class PlatformReviewService {
    static async checkUserPlatformReview(userId, platformId, platformReviewId) {
        const platformReviews = await PlatformReviewClient.getPlatformReviews({ platformReviewId: platformReviewId })
        if (platformReviews.length === 0) {
            throw Error(`No platform review with platformReviewId ${platformReviewId} exists.`)
        }
        if (platformReviews[0].userId != userId) {
            throw Error(`Platform review with platformReviewId ${platformReviewId} doesn't belong to user with userId ${userId}.`)
        }
        return platformReviews[0]
    }
}
