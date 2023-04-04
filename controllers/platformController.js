import expressAsyncHandler from 'express-async-handler'

import { PlatformStatus, StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { PlatformService } from '../services/platformService.js'
import { UtilityService } from '../services/utilityService.js'
import { PlatformClient, PlatformReviewClient } from '../clients/platformClient.js'
import { DBService } from '../services/DBService.js'

export class PlatformController {
    // @desc    Get all platforms of a user
    // @route   GET /api/platform/
    // @access  Provider
    static getAllPlatforms = expressAsyncHandler(async (req, res) => {
        const platforms = await DBService.getData(TableNames.PLATFORM, { userId: req.user.userId })
        res.status(StatusCode.SUCCESSFUL).json(platforms)
    })

    // @desc    Create a platform
    // @route   POST /api/platform/
    // @access  Provider
    static createNewPlatform = expressAsyncHandler(async (req, res) => {
        const platformData = UtilityService.getValues(
            ['name'],
            [
                ['description', ''],
                ['categories', []],
                ['platformStatus', PlatformStatus.DOWNTIME],
                ['platformAddress', {}]
            ],
            req.body
        )
        platformData.userId = req.user.userId
        await PlatformService.uniquePlatformName(platformData.name)
        const platform = await DBService.createData(TableNames.PLATFORM, platformData)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Get a platform of a user
    // @route   GET /api/platform/:platformId
    // @access  Provider
    static getPlatformDetails = expressAsyncHandler(async (req, res) => {
        const platform = await PlatformService.checkUserPlatform(req.user.userId, req.params.platformId)
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Update platform data
    // @route   PUT /api/platform/:platformId
    // @access  Provider
    static updatePlatformDetails = expressAsyncHandler(async (req, res) => {
        const platform = await PlatformService.checkUserPlatform(req.user.userId, req.params.platformId)
        var platformData = UtilityService.getValues(
            [],
            [
                ['name', platform.name],
                ['description', platform.description],
                ['categories', platform.categories],
                ['platformStatus', platform.platformStatus],
                ['platformAddress', platform.platformAddress]
            ],
            req.body
        )
        if (platformData.name != platform.name) {
            await PlatformService.uniquePlatformName(platformData.name)
        }
        const updatedPlatform = await DBService.updateData(TableNames.PLATFORM, platformData, platform.platformId)
        res.status(StatusCode.SUCCESSFUL).json(updatedPlatform)
    })

    // @desc    Delete a Platform
    // @route   DELETE /api/platform/:platformId
    // @access  Provider
    static deletePlatform = expressAsyncHandler(async (req, res) => {
        const platform = await PlatformService.checkUserPlatform(req.user.userId, req.params.platformId)
        const deletedPlatform = await DBService.deleteData(TableNames.PLATFORM, platform.platformId)
        res.status(StatusCode.SUCCESSFUL).json(deletedPlatform)
    })
}

export class PlatformReviewController {
    // @desc    Get all reviews of a platform
    // @route   GET /api/platform/:platformId/review
    // @access  Provider
    static getAllPlatformReviews = expressAsyncHandler(async (req, res) => {
        if (req.user.userType == UserType.PROVIDER) {
            await PlatformService.checkUserPlatform(req.user.userId, req.params.platformId)
        }
        const platfromReviews = await PlatformReviewClient.getPlatformReviews({ platformId: req.params.platformId })
        res.status(StatusCode.SUCCESSFUL).json(platfromReviews)
    })

    // @desc    Create a platform review
    // @route   POST /api/platform/:platformId/review
    // @access  Consumer
    static createNewPlatformReview = expressAsyncHandler(async (req, res) => {
        const platformReviewData = UtilityService.getValues(['comment', 'rating'], [], req.body)
        platformReviewData.userId = req.user.userId
        platformReviewData.platformId = req.params.platformId
        const platformReview = await PlatformReviewClient.createPlatformReview(platformReviewData)
        res.status(StatusCode.SUCCESSFUL).json(platformReview)
    })

    // @desc    Get a platform review
    // @route   GET /api/platform/:platformId/review/:platformReviewId
    // @access  Consumer
    static getPlatformReviewDetails = expressAsyncHandler(async (req, res) => {})

    // @desc    Update platform review
    // @route   PUT /api/platform/:platformId/review/:platformReviewId
    // @access  Provider
    static updatePlatformReviewDetails = expressAsyncHandler(async (req, res) => {})

    // @desc    Delete a Platform Review
    // @route   DELETE /api/platform/:platformId/review/:platformReviewId
    // @access  Provider
    static deletePlatformReview = expressAsyncHandler(async (req, res) => {})
}
