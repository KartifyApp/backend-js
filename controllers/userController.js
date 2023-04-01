import expressAsyncHandler from 'express-async-handler'

import { StatusCode, UserType } from '../models/enumConstants.js'
import { UtilityService } from '../services/utilityService.js'
import { UserClient } from '../clients/userClient.js'
import { TokenClient } from '../clients/externalClient.js'
import { UserService } from '../services/userService.js'

export class UserController {
    // @desc    Register User
    // @route   POST /api/user/
    // @access  Public
    static registerUser = expressAsyncHandler(async (req, res) => {
        const userData = UtilityService.getValues(
            ['name', 'email', 'username', 'password'],
            [
                ['address', {}],
                ['userType', UserType.CONSUMER]
            ],
            req.body
        )
        await UserService.uniqueUserUsername(userData.username)
        const user = await UserClient.createUser(userData)
        res.status(StatusCode.SUCCESSFUL).json(user)
    })

    // @desc    Login User
    // @route   POST /api/user/login
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
