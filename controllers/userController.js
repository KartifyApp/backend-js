import expressAsyncHandler from 'express-async-handler'

import { StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { UtilityService } from '../services/utilityService.js'
import { BcryptClient, TokenClient } from '../clients/externalClient.js'
import { UserService } from '../services/userService.js'
import { DBService } from '../services/DBService.js'

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

    // @desc    Get delivery users
    // @route   GET /api/user/delivery
    // @access  Provider
    static getDeliveryUsers = expressAsyncHandler(async (req, res) => {
        const deliveryUsers = await DBService.getData(TableNames.USER, { userType: UserType.DELIVERY })
        res.status(StatusCode.SUCCESSFUL).json(deliveryUsers)
    })
}
