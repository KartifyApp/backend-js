import { Router } from 'express'
import { MiddlewareService } from '../services/middlewareService.js'
import { OrderController } from '../controllers/orderController.js'

const router = Router()

router.route('/').get(MiddlewareService.authorize, MiddlewareService.consumerAndDeliveryUser, OrderController.getAllOrders)

router
    .route('/:orderId')
    .get(MiddlewareService.authorize, OrderController.getOrderDetails)
    .post(MiddlewareService.authorize, MiddlewareService.deliveryUser, OrderController.updateOrderDeliveryJob)
    .put(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, OrderController.updateOrderDetails)

router.get('/:orderId/product', MiddlewareService.authorize, OrderController.getOrderProducts)

router.put('/:orderId/cancel', MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, OrderController.cancelOrder)
router.put('/:orderId/pay', MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, OrderController.payOrder)

export default router
