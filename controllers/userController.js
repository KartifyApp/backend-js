import expressAsyncHandler from 'express-async-handler'

import { StatusCode, UserType } from '../models/enumConstants.js'
import { ConstraintService } from '../services/constraintService.js'
import { TokenService } from '../services/externalService.js'
import { UserService } from '../services/userService.js'
import { UtilityService } from '../services/utilityService.js'

export class UserController {
    // @desc    Register User
    // @route   POST /api/user/
    // @access  Public
    static registerUser = expressAsyncHandler(async (req, res) => {
        var userData = UtilityService.getValues(
            ['name', 'email', 'username', 'password'],
            [
                ['address', {}],
                ['userType', UserType.CONSUMER]
            ],
            req.body
        )
        await ConstraintService.uniqueUserUsername(userData.username)
        const user = await UserService.createUser(userData)
        res.status(StatusCode.SUCCESSFUL).json(user)
    })

    // @desc    Login User
    // @route   POST /api/user/login
    // @access  Public
    static loginUser = expressAsyncHandler(async (req, res) => {
        var userData = UtilityService.getValues(['username', 'password'], [], req.body)
        const user = await ConstraintService.checkPassword(userData.username, userData.password)
        res.status(StatusCode.SUCCESSFUL).json({
            ...user,
            token: TokenService.generateToken(user.userId)
        })
    })
}

// export const logout = expressAsyncHandler(async(req, res) => {
//     TokenService.destroyToken()
// })
