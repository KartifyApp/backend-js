import asyncHandler from 'express-async-handler'
import { TokenService } from './tokenService.js'
import { UserService } from './userService.js'

export class MiddlewareService {
    static authorize = asyncHandler(async (req, res, next) => {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                token = req.headers.authorization.split(' ')[1]
                const decoded = TokenService.decodeToken(token)

                req.user = await UserService.getUserById(decoded.id)
                next()
            } catch (error) {
                console.error(error)
                res.status(401)
                throw Error('Not authorized, token failed')
            }
        } else {
            res.status(401)
            throw Error('Not authorized, no token')
        }
    })

    static adminUser = asyncHandler(async (req, res, next) => {})
}
