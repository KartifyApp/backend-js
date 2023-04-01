import { PlatformClient } from '../clients/platformClient.js'

export class PlatformService {
    static async uniquePlatformName(name) {
        const platform = await PlatformClient.getPlatformByName(name)
        if (platform) {
            throw Error(`Platform with name ${name} already exists.`)
        }
        return true
    }

    static async checkUserPlatform(userId, platformId) {
        const platform = await PlatformClient.getPlatformById(platformId)
        if (!platform) {
            throw Error(`No platform with platformId ${platformId} exists.`)
        }
        if (platform.userId != userId) {
            throw Error(`Platform with platformId ${platformId} doesn't belong to user with userId ${userId}.`)
        }
        return platform
    }
}
