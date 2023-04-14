import expressAsyncHandler from 'express-async-handler'

import { UtilityService } from '../services/utilityService.js'
import { AddressKeys, StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { OrderService } from '../services/orderService.js'
import { PlatformService } from '../services/platformService.js'
import { DBService } from '../services/DBService.js'
import { DeliveryJobService } from '../services/deliveryJobService.js'

export class OrderController {
    // @desc    Create a order
    // @route   POST /api/order/
    // @access  Provider, Consumer and Delivery
    static getAllOrders = expressAsyncHandler(async (req, res) => {
        if (req.user.userType == UserType.PROVIDER) {
            const orderData = UtilityService.getValues(['platformId'], [], req.query)
            await PlatformService.getUserPlatform(req.user.userId, orderData.platformId)
            const orders = await DBService.getData(TableNames.ORDER, orderData)
            res.status(StatusCode.SUCCESSFUL).json(orders)
        } else if (req.user.userType == UserType.CONSUMER) {
            const orders = await DBService.getData(TableNames.ORDER, { userId: req.user.userId })
            res.status(StatusCode.SUCCESSFUL).json(orders)
        } else {
            const orderData = UtilityService.getValues(['deliveryJobId'], [], req.query)
            await DeliveryJobService.getUserDeliveryJob(req.user, orderData.DeliveryJobId)
            const orders = await DBService.getData(TableNames.ORDER, orderData)
            res.status(StatusCode.SUCCESSFUL).json(orders)
        }
    })

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
        orderData.totalPrice = orderData.orderPrice
        orderData.userId = req.user.userId
        const createdOrder = await OrderService.createSafeOrder(orderData, orderProductsData)
        res.status(StatusCode.SUCCESSFUL).json(createdOrder)
    })
}
