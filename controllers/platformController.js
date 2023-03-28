import expressAsyncHandler from 'express-async-handler'

import { PlatformStatus, StatusCode } from '../models/enumConstants.js'
import { ConstraintService } from '../services/constraintService.js'
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
                ['platformStatus', PlatformStatus.DOWNTIME],
                ['address', {}]
            ],
            req.body
        )
        platformData.userId = req.user.userId
        await ConstraintService.uniquePlatformName(platformData.name)
        const platform = await PlatformService.createPlatform(platformData)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Get a platform of a user
    // @route   GET /api/platform/:platformId
    // @access  Provider
    static getPlatform = expressAsyncHandler(async (req, res) => {
        const platform = await ConstraintService.checkUserPlatform(req.user.userId, req.params.platformId)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Update platform data
    // @route   PUT /api/platform/:platformId
    // @access  Provider
    static updatePlatform = expressAsyncHandler(async (req, res) => {
        var platform = await ConstraintService.checkUserPlatform(req.user.userId, req.params.platformId)
        var platformData = UtilityService.getValues(
            [],
            [
                ['name', platform.name],
                ['description', platform.description],
                ['categories', platform.categories],
                ['platformStatus', platform.platformStatus],
                ['address', platform.address]
            ],
            req.body
        )
        platformData.platformId = platform.platformId
        if (platformData.name != platform.name) {
            await ConstraintService.uniquePlatformName(platformData.name)
        }
        await PlatformService.updatePlatform(platformData)
        platform = await PlatformService.getPlatformByName(platformData.name)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })
}
