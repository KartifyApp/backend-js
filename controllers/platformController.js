import expressAsyncHandler from 'express-async-handler'

import { PlatformStatus, StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { PlatformReviewService, PlatformService } from '../services/platformService.js'
import { UtilityService } from '../services/utilityService.js'
import { DBService } from '../services/DBService.js'
import { DeliveryJobService } from '../services/deliveryJobService.js'

export class PlatformController {
    // @desc    Get all platforms of a user
    // @route   GET /api/platform/
    // @access  Provider and Consumer
    static getAllPlatforms = expressAsyncHandler(async (req, res) => {
        const platforms =
            req.user.userType == UserType.PROVIDER
                ? await DBService.getData(TableNames.PLATFORM, { userId: req.user.userId })
                : req.user.userType == UserType.CONSUMER
                ? await DBService.getData(TableNames.PLATFORM, {})
                : await Promise.all(
                      (
                          await DBService.getData(TableNames.DELIVERY_JOB, { userId: req.user.userId })
                      ).map(async (deliveryJob) => await PlatformService.getPlatformById(deliveryJob.platformId))
                  )
        res.status(StatusCode.SUCCESSFUL).json(platforms)
    })

    // @desc    Create a platform
    // @route   POST /api/platform/
    // @access  Provider
    static createNewPlatform = expressAsyncHandler(async (req, res) => {
        const platformData = UtilityService.getValues(
            ['name'],
            [
                ['image', ''],
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
    // @access  Private
    static getPlatformDetails = expressAsyncHandler(async (req, res) => {
        const platform =
            req.user.userType == UserType.PROVIDER
                ? await PlatformService.getUserPlatform(req.user.userId, req.params.platformId)
                : await PlatformService.getPlatformById(req.params.platformId)
        if (req.user.userType == UserType.DELIVERY) {
            await DeliveryJobService.getUniqueDeliveryJob(req.user.userId, req.params.platformId)
        }
        res.status(StatusCode.SUCCESSFUL).json(platform)
    })

    // @desc    Update platform data
    // @route   PUT /api/platform/:platformId
    // @access  Provider
    static updatePlatformDetails = expressAsyncHandler(async (req, res) => {
        const platform = await PlatformService.getUserPlatform(req.user.userId, req.params.platformId)
        const platformData = UtilityService.getUpdateValues(
            ['name', 'image', 'description', 'categories', 'platformStatus', 'platformAddress'],
            platform,
            req.body
        )
        if (platformData.name) {
            await PlatformService.uniquePlatformName(platformData.name)
        }
        const updatedPlatform = await DBService.updateData(TableNames.PLATFORM, platformData, platform.platformId)
        res.status(StatusCode.SUCCESSFUL).json(updatedPlatform)
    })

    // @desc    Delete a Platform
    // @route   DELETE /api/platform/:platformId
    // @access  Provider
    static deletePlatform = expressAsyncHandler(async (req, res) => {
        const platform = await PlatformService.getUserPlatform(req.user.userId, req.params.platformId)
        const deletedPlatform = await DBService.deleteData(TableNames.PLATFORM, platform.platformId)
        res.status(StatusCode.SUCCESSFUL).json(deletedPlatform)
    })
}

export class PlatformReviewController {
    // @desc    Get all reviews of a platform
    // @route   GET /api/platform/review
    // @access  Provider and Consumer
    static getAllPlatformReviews = expressAsyncHandler(async (req, res) => {
        if (req.user.userType == UserType.PROVIDER) {
            const platformReviewData = UtilityService.getValues(['platformId'], [], req.query)
            await PlatformService.getUserPlatform(req.user.userId, platformReviewData.platformId)
            const platformReviews = await DBService.getData(TableNames.PLATFORM_REVIEW, platformReviewData)
            res.status(StatusCode.SUCCESSFUL).json(platformReviews)
        } else {
            const platformReviews = await DBService.getData(
                TableNames.PLATFORM_REVIEW,
                req.query.platformId ? { platformId: req.query.platformId } : { userId: req.user.userId }
            )
            res.status(StatusCode.SUCCESSFUL).json(platformReviews)
        }
    })

    // @desc    Create a platform review
    // @route   POST /api/platform/review
    // @access  Consumer
    static createNewPlatformReview = expressAsyncHandler(async (req, res) => {
        const platformReviewData = UtilityService.getValues(['comment', 'rating', 'platformId'], [], req.body)
        platformReviewData.userId = req.user.userId
        const platformReview = await DBService.createData(TableNames.PLATFORM_REVIEW, platformReviewData)
        res.status(StatusCode.SUCCESSFUL).json(platformReview)
    })

    // @desc    Get a platform review
    // @route   GET /api/platform/review/:platformReviewId
    // @access  Consumer
    static getPlatformReviewDetails = expressAsyncHandler(async (req, res) => {
        const platformReview = await PlatformReviewService.getUserPlatformReview(req.user.userId, req.params.platformReviewId)
        res.status(StatusCode.SUCCESSFUL).json(platformReview)
    })

    // @desc    Update platform review
    // @route   PUT /api/platform/review/:platformReviewId
    // @access  Consumer
    static updatePlatformReviewDetails = expressAsyncHandler(async (req, res) => {
        const platformReview = await PlatformReviewService.getUserPlatformReview(req.user.userId, req.params.platformReviewId)
        const platformReviewData = UtilityService.getUpdateValues(['comment', 'rating'], platformReview, req.body)
        const updatedPlatformReview = await DBService.updateData(TableNames.PLATFORM_REVIEW, platformReviewData, platformReview.platformReviewId)
        res.status(StatusCode.SUCCESSFUL).json(updatedPlatformReview)
    })

    // @desc    Delete a Platform Review
    // @route   DELETE /api/platform/review/:platformReviewId
    // @access  Consumer
    static deletePlatformReview = expressAsyncHandler(async (req, res) => {
        const platformReview = await PlatformReviewService.getUserPlatformReview(req.user.userId, req.params.platformReviewId)
        const deletedPlatformReview = await DBService.deleteData(TableNames.PLATFORM_REVIEW, platformReview.platformReviewId)
        res.status(StatusCode.SUCCESSFUL).json(deletedPlatformReview)
    })
}
