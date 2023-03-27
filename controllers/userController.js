import expressAsyncHandler from 'express-async-handler'

import { StatusCode } from '../models/enumConstants.js'
import { TokenService } from '../services/tokenService.js'
import { UserService } from '../services/userService.js'
import { UtilityService } from '../services/utilityService.js'

// @desc    Register User
// @route   POST /api/users/
// @access  Public
export const registerUser = expressAsyncHandler(async (req, res) => {
    var userData = UtilityService.getObject(['name', 'email', 'username', 'password', 'userType'], req.body)
    if (!userData) {
        throw Error(`Fill necessary fields to register.`)
    }
    if (req.body.address) {
        userData.address = req.body.address
    } else {
        userData.address = {}
    }
    var user = await UserService.getUserByUsername(userData.username)
    if (user) {
        throw Error(`User with username ${user.username} already registered.`)
    }
    await UserService.createUser(userData)
    user = await UserService.getUserByUsername(userData.username)
    delete user.password
    res.status(StatusCode.SUCCESSFUL).json({
        ...user,
        token: TokenService.generateToken(user.userId)
    })
})
