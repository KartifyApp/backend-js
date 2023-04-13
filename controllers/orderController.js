import expressAsyncHandler from 'express-async-handler'

import { UtilityService } from '../services/utilityService.js'
import { AddressKeys, StatusCode } from '../models/enumConstants.js'
import { OrderService } from '../services/orderService.js'

export class OrderController {
    // @desc    Create a order
    // @route   POST /api/order/
    // @access  Provider, Consumer and Delivery
    static getAllOrders = expressAsyncHandler(async (req, res) => {})

    // @desc    Create a order
    // @route   POST /api/order/
    // @access  Consumer
    static createNewOrder = expressAsyncHandler(async (req, res) => {
        const orderData = UtilityService.getValues(['shippingAddress', 'paymentMethod'], [], req.body)
        orderData.shippingAddress = UtilityService.getValues(AddressKeys, [], orderData.shippingAddress)
        const orderProductsData = UtilityService.getValues(['productList'], [], req.body).productList.map((productData) =>
            UtilityService.getValues(['productId', 'quantity'], [], productData)
        )
        orderData.orderPrice = await OrderService.getOrderPrice(orderProductsData)
        orderData.userId = req.user.userId
        const createdOrder = await OrderService.createSafeOrder(orderData, orderProductsData)
        res.status(StatusCode.SUCCESSFUL).json(createdOrder)
    })
}
