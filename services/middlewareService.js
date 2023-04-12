import expressAsyncHandler from 'express-async-handler'

import { StatusCode, UserType } from '../models/enumConstants.js'
import { TokenClient } from '../clients/externalClient.js'
import { UserService } from './userService.js'

export class MiddlewareService {
    static authorize = expressAsyncHandler(async (req, res, next) => {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const decoded = TokenClient.decodeToken(req.headers.authorization.split(' ')[1])

                req.user = await UserService.getUserById(decoded.userId)
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

    static adminUser = expressAsyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.ADMIN) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Admin.`)
        }
    })

    static providerUser = expressAsyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.PROVIDER) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Provider.`)
        }
    })

    static consumerUser = expressAsyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.CONSUMER) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Consumer.`)
        }
    })

    static providerAndConsumerUser = expressAsyncHandler(async (req, res, next) => {
        if (req.user && (req.user.userType == UserType.PROVIDER || req.user.userType == UserType.CONSUMER)) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Provider or Consumer.`)
        }
    })

    static deliveryUser = expressAsyncHandler(async (req, res, next) => {
        if (req.user && req.user.userType === UserType.DELIVERY) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Delivery.`)
        }
    })

    static providerAndDeliveryUser = expressAsyncHandler(async (req, res, next) => {
        if (req.user && (req.user.userType == UserType.PROVIDER || req.user.userType == UserType.DELIVERY)) {
            next()
        } else {
            res.status(StatusCode.UNAUTHORIZED)
            throw Error(`Not authorized as Provider or Delivery.`)
        }
    })

    static notFound = (req, res, next) => {
        const error = new Error(`Not found ${req.originalUrl}`)
        res.status(404)
        next(error)
    }

    static errorHandler = (err, req, res, next) => {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode
        res.status(statusCode)
        res.json({
            message: err.message,
            stack: err.stack.split('\n').map((str) => str.trim())
        })
    }
}
