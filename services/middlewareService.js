import asyncHandler from 'express-async-handler'
import { StatusCode, UserType } from '../models/enumConstants.js'
import { UserClient } from '../clients/userClient.js'
import { TokenClient } from '../clients/externalClient.js'

export class MiddlewareService {
    static authorize = asyncHandler(async (req, res, next) => {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const decoded = TokenClient.decodeToken(req.headers.authorization.split(' ')[1])

                req.user = await UserClient.getUserById(decoded.userId)
                next()
            } catch (error) {
                res.status(StatusCode.UNAUTHORIZED)
                throw Error('Not authorized, token failed')
            }
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error('Not authorized, no token')
        }
    })

    static adminUser = asyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.ADMIN) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Admin.`)
        }
    })

    static providerUser = asyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.PROVIDER) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Provider.`)
        }
    })

    static consumerUser = asyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.CONSUMER) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Consumer.`)
        }
    })

    static deliveryUser = asyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.DELIVERY) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Delivery.`)
        }
    })
}
