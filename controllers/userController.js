import expressAsyncHandler from 'express-async-handler'

import { StatusCode, UserType } from '../models/enumConstants.js'
import { UtilityService } from '../services/utilityService.js'
import { UserClient } from '../clients/userClient.js'
import { BcryptClient, TokenClient } from '../clients/externalClient.js'
import { UserService } from '../services/userService.js'

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
        const user = await UserClient.createUser(userData)
        res.status(StatusCode.SUCCESSFUL).json(user)
    })

    // @desc    Get user details
    // @route   GET /api/user/
    // @access  Private
    static getUserDetails = expressAsyncHandler(async (req, res) => {
        const user = await UserClient.getUserById(req.user.userId)
        delete user.password
        res.status(StatusCode.SUCCESSFUL).json(user)
    })

    // @desc    Update user details
    // @route   PUT /api/user/
    // @access  Private
    static updateUserDetails = expressAsyncHandler(async (req, res) => {
        const user = await UserClient.getUserById(req.user.userId)
        const userData = UtilityService.getValues(
            [],
            [
                ['name', user.name],
                ['email', user.email],
                ['username', user.username],
                ['userAddress', user.userAddress]
            ],
            req.body
        )
        if (req.body.password) {
            userData.password = await BcryptClient.hash(req.body.password)
        }
        userData.userId = user.userId
        if (userData.username != user.username) {
            await UserService.uniqueUserUsername(userData.username)
        }
        const updatedUser = await UserClient.updateUser(userData)
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
