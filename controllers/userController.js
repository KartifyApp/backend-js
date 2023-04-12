import expressAsyncHandler from 'express-async-handler'

import { StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { UtilityService } from '../services/utilityService.js'
import { BcryptClient, TokenClient } from '../clients/externalClient.js'
import { DeliveryJobService, UserService } from '../services/userService.js'
import { DBService } from '../services/DBService.js'
import { PlatformService } from '../services/platformService.js'

export class UserController {
    // @desc    Register User
    // @route   POST /api/user/
    // @access  Public
    static registerUser = expressAsyncHandler(async (req, res) => {
        const userData = UtilityService.getValues(
            ['name', 'email', 'username', 'password'],
            [
                ['userAddress', {}],
                ['userType', UserType.CONSUMER]
            ],
            req.body
        )
        userData.password = await BcryptClient.hash(userData.password)
        await UserService.uniqueUserUsername(userData.username)
        const user = await DBService.createData(TableNames.USER, userData)
        delete user.password
        res.status(StatusCode.SUCCESSFUL).json(user)
    })

    // @desc    Get user details
    // @route   GET /api/user/
    // @access  Private
    static getUserDetails = expressAsyncHandler(async (req, res) => {
        const user = await UserService.getUserById(req.user.userId)
        res.status(StatusCode.SUCCESSFUL).json(user)
    })

    // @desc    Update user details
    // @route   PUT /api/user/
    // @access  Private
    static updateUserDetails = expressAsyncHandler(async (req, res) => {
        const user = await UserService.getUserById(req.user.userId)
        const userData = UtilityService.getUpdateValues(['name', 'email', 'username', 'userAddress'], user, req.body)
        if (req.body.password) {
            userData.password = await BcryptClient.hash(req.body.password)
        }
        if (userData.username != user.username) {
            await UserService.uniqueUserUsername(userData.username)
        }
        const updatedUser = await DBService.updateData(TableNames.USER, userData, user.userId)
        delete updatedUser.password
        res.status(StatusCode.SUCCESSFUL).json(updatedUser)
    })

    // @desc    Login User
    // @route   POST /api/user/auth
    // @access  Public
    static loginUser = expressAsyncHandler(async (req, res) => {
        const userData = UtilityService.getValues(['username', 'password'], [], req.body)
        const user = await UserService.checkPassword(userData.username, userData.password)
        res.status(StatusCode.SUCCESSFUL).json({
            ...user,
            token: TokenClient.generateToken(user.userId)
        })
    })
}

export class DeliveryJobController {
    // @desc    Get delivery jobs of a platform
    // @route   GET /api/user/delivery
    // @access  Provider
    static getAllDeliveryJobs = expressAsyncHandler(async (req, res) => {
        const deliveryJobData = UtilityService.getValues(['platformId'], [], req.query)
        const platform = await PlatformService.getUserPlatform(req.user.userId, deliveryJobData.platformId)
        const deliveryJobs = await DBService.getData(TableNames.DELIVERY_JOB, { platformId: platform.platformId })
        res.status(StatusCode.SUCCESSFUL).json(deliveryJobs)
    })

    // @desc    Create a delivery job
    // @route   POST /api/user/delivery
    // @access  Provider
    static createNewDeliveryJob = expressAsyncHandler(async (req, res) => {
        const deliveryJobData = UtilityService.getValues(['platformId', 'userId', 'salary'], [], req.body)
        await DeliveryJobService.uniqueDeliveryJob(deliveryJobData.userId, deliveryJobData.platformId)
        await DeliveryJobService.getDeliveryUser(deliveryJobData.userId)
        const deliveryJob = await DBService.createData(TableNames.DELIVERY_JOB, deliveryJobData)
        res.status(StatusCode.SUCCESSFUL).json(deliveryJob)
    })

    // @desc    Get a delivery job
    // @route   GET /api/user/delivery/:deliveryJobId
    // @access  Provider and Delivery
    static getDeliveryJobDetails = expressAsyncHandler(async (req, res) => {
        const deliveryJob = await DeliveryJobService.getUserDeliveryJob(req.user, req.params.deliveryJobId)
        res.status(StatusCode.SUCCESSFUL).json(deliveryJob)
    })

    // @desc    Update delivery job
    // @route   PUT /api/user/delivery/:deliveryJobId
    // @access  Provider and Delivery
    static updateDeliveryJobDetails = expressAsyncHandler(async (req, res) => {
        const deliveryJob = await DeliveryJobService.getUserDeliveryJob(req.user, req.params.deliveryJobId)
        const deliveryJobData = UtilityService.getUpdateValues([req.user.userType == UserType.PROVIDER ? 'salary' : 'deliveryStatus'], deliveryJob, req.body)
        const updatedDeliveryjob = await DBService.updateData(TableNames.DELIVERY_JOB, deliveryJobData, deliveryJob.deliveryJobId)
        res.status(StatusCode.SUCCESSFUL).json(updatedDeliveryjob)
    })

    // @desc    Delete delivery job
    // @route   DELETE /api/user/delivery/:deliveryJobId
    // @access  Provider and Delivery
    static deleteDeliveryJob = expressAsyncHandler(async (req, res) => {
        const deliveryJob = await DeliveryJobService.getUserDeliveryJob(req.user, req.params.deliveryJobId)
        const deletedPlatform = await DBService.deleteData(TableNames.DELIVERY_JOB, deliveryJob.deliveryJobId)
        res.status(StatusCode.SUCCESSFUL).json(deletedPlatform)
    })
}
