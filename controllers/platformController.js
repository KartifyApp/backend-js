import expressAsyncHandler from 'express-async-handler'

import { PlatformStatus, StatusCode } from '../models/enumConstants.js'
import { PlatformService } from '../services/platformService.js'
import { UtilityService } from '../services/utilityService.js'
import { PlatformClient } from '../clients/platformClient.js'

export class PlatformController {
    // @desc    Get all platforms of a user
    // @route   GET /api/platform/
    // @access  Provider
    static getAllPlatforms = expressAsyncHandler(async (req, res) => {
        const platforms = await PlatformClient.getUserPlatforms(req.user.userId)
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
        await PlatformService.uniquePlatformName(platformData.name)
        const platform = await PlatformClient.createPlatform(platformData)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Get a platform of a user
    // @route   GET /api/platform/:platformId
    // @access  Provider
    static getPlatform = expressAsyncHandler(async (req, res) => {
        const platform = await PlatformService.checkUserPlatform(req.user.userId, req.params.platformId)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Update platform data
    // @route   PUT /api/platform/:platformId
    // @access  Provider
    static updatePlatformData = expressAsyncHandler(async (req, res) => {
        var platform = await PlatformService.checkUserPlatform(req.user.userId, req.params.platformId)
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
            await PlatformService.uniquePlatformName(platformData.name)
        }
        platform = await PlatformClient.updatePlatform(platformData)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Delete a Platform
    // @route   DELETE /api/platform/:platformId
    // @access  Provider
    static deletePlatform = expressAsyncHandler(async (req, res) => {
        var platform = await PlatformService.checkUserPlatform(req.user.userId, req.params.platformId)
        platform = await PlatformClient.deletePlatform(platform)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })
}
