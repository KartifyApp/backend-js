import expressAsyncHandler from 'express-async-handler'

import { StatusCode, UserType } from '../models/enumConstants.js'
import { TokenService } from '../services/tokenService.js'
import { UserService } from '../services/userService.js'
import { UtilityService } from '../services/utilityService.js'

// @desc    Register User
// @route   POST /api/user/
// @access  Public
export const registerUser = expressAsyncHandler(async (req, res) => {
    var userData = UtilityService.getValues(
        ['name', 'email', 'username', 'password'],
        [
            ['address', {}],
            ['userType', UserType.CONSUMER]
        ],
        req.body
    )
    if (!userData) {
        throw Error(`Fill necessary fields to register.`)
    }
    var user = await UserService.getUserByUsername(userData.username)
    if (user) {
        throw Error(`User with username ${user.username} already registered.`)
    }
    await UserService.createUser(userData)
    user = await UserService.getUserByUsername(userData.username)
    delete user.password
    res.status(StatusCode.SUCCESSFUL).json(user)
})

// @desc    Login User
// @route   POST /api/user/login
// @access  Public
export const loginUser = expressAsyncHandler(async (req, res) => {
    var userData = UtilityService.getValues(['username', 'password'], [], req.body)
    if (!userData) {
        throw Error(`Provide username and password.`)
    }
    var user = await UserService.checkPassword(userData.username, userData.password)
    delete user.password
    res.status(StatusCode.SUCCESSFUL).json({
        ...user,
        token: TokenService.generateToken(user.userId)
    })
})

// export const logout = expressAsyncHandler(async(req, res) => {
//     TokenService.destroyToken()
// })
