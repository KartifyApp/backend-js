import expressAsyncHandler from 'express-async-handler'

import { PlatformStatus, StatusCode } from '../models/enumConstants.js'
import { PlatformService } from '../services/platformService.js'
import { UtilityService } from '../services/utilityService.js'

export class PlatformController {
    // @desc    Get all platforms of a user
    // @route   GET /api/platform/
    // @access  Provider
    static getAllPlatforms = expressAsyncHandler(async (req, res) => {
        const platforms = await PlatformService.getUserPlatforms(req.user.userId)
        res.status(StatusCode.SUCCESSFUL).json(platforms)
    })

    // @desc    Create a platform
    // @route   POST /api/platform/
    // @access  Provider
    static createNewPlatform = expressAsyncHandler(async (req, res) => {
        var platformData = UtilityService.getValues(
            ['name'],
            [
                ['description', ''],
                ['categories', []],
                ['platformStatus', PlatformStatus.DOWNTIME]
            ],
            req.body
        )
        platformData.userId = req.user.userId
        var platform = await PlatformService.getPlatformByName(platformData.name)
        console.log(platform)
        if (platform) {
            throw Error(`Platform with name ${platformData.name} already exists.`)
        }
        await PlatformService.createPlatform(platformData)
        platform = await PlatformService.getPlatformByName(platformData.name)

        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Get a platform of a user
    // @route   GET /api/platform/:platformId
    // @access  Provider
    static getPlatform = expressAsyncHandler(async (req, res) => {
        const platforms = await PlatformService.getUserPlatforms(req.user.userId, req.params.platformId)
        if (platforms.length === 0) {
            throw Error(`No platform ${req.params.platformId} exists for user ${req.user.userId}.`)
        }
        res.status(StatusCode.SUCCESSFUL).json(platforms[0])
    })
}
