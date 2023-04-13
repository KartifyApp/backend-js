import { Router } from 'express'
import { MiddlewareService } from '../services/middlewareService.js'
import { OrderController } from '../controllers/orderController.js'

const router = Router()

router
    .route('/')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser)
    .post(MiddlewareService.authorize, MiddlewareService.consumerUser, OrderController.createNewOrder)

export default router
