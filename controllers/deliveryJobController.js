import expressAsyncHandler from 'express-async-handler'
import { DeliveryStatus, StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { DBService } from '../services/DBService.js'
import { DeliveryJobService } from '../services/deliveryJobService.js'
import { PlatformService } from '../services/platformService.js'
import { UtilityService } from '../services/utilityService.js'

export class DeliveryJobController {
    // @desc    Get delivery jobs of a platform
    // @route   GET /api/delivery-job
    // @access  Provider and Delivery
    static getAllDeliveryJobs = expressAsyncHandler(async (req, res) => {
        const deliveryJobData = {}
        switch (req.user.userType) {
            case UserType.PROVIDER:
                deliveryJobData.platformId = UtilityService.getValues(['platformId'], [], req.query).platformId
                await PlatformService.getUserPlatform(req.user.userId, deliveryJobData.platformId)
                break
            case UserType.DELIVERY:
                deliveryJobData.userId = req.user.userId
                break
        }
        const deliveryJobs = await DBService.getData(TableNames.DELIVERY_JOB, deliveryJobData)
        res.status(StatusCode.SUCCESSFUL).json(deliveryJobs)
    })

    // @desc    Create a delivery job
    // @route   POST /api/delivery-job
    // @access  Provider
    static createNewDeliveryJob = expressAsyncHandler(async (req, res) => {
        const deliveryJobData = UtilityService.getValues(['platformId', 'userId', 'salary'], [], req.body)
        await DeliveryJobService.uniqueDeliveryJob(deliveryJobData.userId, deliveryJobData.platformId)
        const deliveryUser = await DBService.getData(TableNames.USER, { userId: deliveryJobData.userId, userType: UserType.DELIVERY })
        if (deliveryUser.length == 0) {
            throw Error(`No delivery user with user ID ${deliveryJobData.userId} exists.`)
        }
        const deliveryJob = await DBService.createData(TableNames.DELIVERY_JOB, deliveryJobData)
        res.status(StatusCode.SUCCESSFUL).json(deliveryJob)
    })

    // @desc    Get a delivery job
    // @route   GET /api/delivery-job/:deliveryJobId
    // @access  Provider and Delivery
    static getDeliveryJobDetails = expressAsyncHandler(async (req, res) => {
        const deliveryJob = await DeliveryJobService.getDeliveryJobByUser(req.user, req.params.deliveryJobId)
        res.status(StatusCode.SUCCESSFUL).json(deliveryJob)
    })

    // @desc    Update delivery job
    // @route   PUT /api/delivery-job/:deliveryJobId
    // @access  Provider and Delivery
    static updateDeliveryJobDetails = expressAsyncHandler(async (req, res) => {
        const deliveryJob = await DeliveryJobService.getDeliveryJobByUser(req.user, req.params.deliveryJobId)
        const deliveryJobData = UtilityService.getUpdateValues([req.user.userType == UserType.PROVIDER ? 'salary' : 'deliveryStatus'], deliveryJob, req.body)
        if (deliveryJobData.deliveryStatus) {
            if (deliveryJob.deliveryStatus == DeliveryStatus.WORKING) {
                throw Error(`Cannot update from state WORKING.`)
            }
            if (deliveryJobData.deliveryStatus == DeliveryStatus.WORKING) {
                throw Error(`Cannot update to state WORKING.`)
            }
        }
        const updatedDeliveryjob = await DBService.updateData(TableNames.DELIVERY_JOB, deliveryJobData, deliveryJob.deliveryJobId)
        res.status(StatusCode.SUCCESSFUL).json(updatedDeliveryjob)
    })

    // @desc    Delete delivery job
    // @route   DELETE /api/delivery-job/:deliveryJobId
    // @access  Provider and Delivery
    static deleteDeliveryJob = expressAsyncHandler(async (req, res) => {
        const deliveryJob = await DeliveryJobService.getDeliveryJobByUser(req.user, req.params.deliveryJobId)
        const deletedPlatform = await DBService.deleteData(TableNames.DELIVERY_JOB, deliveryJob.deliveryJobId)
        res.status(StatusCode.SUCCESSFUL).json(deletedPlatform)
    })
}
