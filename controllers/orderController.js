import expressAsyncHandler from 'express-async-handler'

import { UtilityService } from '../services/utilityService.js'
import { AddressKeys, PaymentMethod, PaymentStatus, StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { OrderService } from '../services/orderService.js'
import { PlatformService } from '../services/platformService.js'
import { DBService } from '../services/DBService.js'
import { DeliveryJobService } from '../services/deliveryJobService.js'
import { SHIPPING_PRICE, TAX_PRICE_PERCENT } from '../constants.js'

export class OrderController {
    // @desc    Get all orders
    // @route   Get /api/order/
    // @access  Consumer and Delivery
    static getAllOrders = expressAsyncHandler(async (req, res) => {
        const orders =
            req.user.userType == UserType.CONSUMER
                ? await DBService.getData(TableNames.ORDER, { userId: req.user.userId })
                : await OrderService.getDeliveryOrders(req.user.userId)
        res.status(StatusCode.SUCCESSFUL).json(orders)
    })

    // @desc    Get all platform orders
    // @route   POST /api/platform/:platformId/order
    // @access  Producer and Delivery
    static getAllPlatformOrders = expressAsyncHandler(async (req, res) => {
        if (req.user.userType == UserType.PROVIDER) {
            await PlatformService.getUserPlatform(req.user.userId, req.params.platformId)
        } else {
            await DeliveryJobService.getUniqueDeliveryJob(req.user.userId, req.params.platformId)
        }
        const orders = await DBService.getData(TableNames.ORDER, { platformId: req.params.platformId })
        res.status(StatusCode.SUCCESSFUL).json(orders)
    })

    // @desc    Create a order
    // @route   POST /api/platform/:platformId/order
    // @access  Consumer
    static createNewOrder = expressAsyncHandler(async (req, res) => {
        const orderData = UtilityService.getValues(['shippingAddress', 'paymentMethod'], [], req.body)
        orderData.platformId = req.params.platformId
        orderData.shippingAddress = UtilityService.getValues(AddressKeys, [], orderData.shippingAddress)
        const cartProducts = UtilityService.getValues(['cartProducts'], [], req.body).cartProducts

        orderData.orderPrice = await OrderService.getOrderPrice(cartProducts)
        orderData.taxPrice = (orderData.orderPrice * TAX_PRICE_PERCENT) / 100
        orderData.shippingPrice = SHIPPING_PRICE
        orderData.totalPrice = orderData.orderPrice + orderData.taxPrice + orderData.shippingPrice
        if (orderData.paymentMethod == PaymentMethod.ONLINE_TRANSACTION) {
            orderData.paymentStatus = PaymentStatus.PAYMENT_PROCESSING
        }
        orderData.userId = req.user.userId
        const createdOrder = await OrderService.createSafeOrder(orderData, cartProducts)
        res.status(StatusCode.SUCCESSFUL).json(createdOrder)
    })

    // @desc    Update delivery job for order
    // @route   POST /api/order/:orderId
    // @access  Delivery
    static updateOrderDeliveryJob = expressAsyncHandler(async (req, res) => {
        const order = await OrderService.getOrderById(req.params.orderId)
        const deliveryJob = await DeliveryJobService.getUniqueDeliveryJob(req.user.userId, order.platformId)
        if (order.deliveryJobId) {
            throw Error(`Delivery job already assigned for order ID ${order.orderId}.`)
        }
        const updatedOrder = await DBService.updateData(TableNames.ORDER, { deliveryJobId: deliveryJob.deliveryJobId }, order.orderId)
        res.status(StatusCode.SUCCESSFUL).json(updatedOrder)
    })

    // @desc    Get order by id
    // @route   GET /api/order/:orderId
    // @access  Private
    static getOrderDetails = expressAsyncHandler(async (req, res) => {
        const order = await OrderService.getOrderByUser(req.user, req.params.orderId)
        res.status(StatusCode.SUCCESSFUL).json(order)
    })

    // @desc    Get order products by id
    // @route   GET /api/order/:orderId/product
    // @access  Private
    static getOrderProducts = expressAsyncHandler(async (req, res) => {
        const order = await OrderService.getOrderByUser(req.user, req.params.orderId)
        const orderProducts = await DBService.getData(TableNames.PRODUCT_JOIN_ORDER_PRODUCT, { orderId: order.orderId })
        res.status(StatusCode.SUCCESSFUL).json(orderProducts)
    })

    // @desc    Update order by id
    // @route   PUT /api/order/:orderId
    // @access  Provider and Delivery
    static updateOrderDetails = expressAsyncHandler(async (req, res) => {
        const order = await OrderService.getOrderByUser(req.user, req.params.orderId)
        const state = {
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod
        }
        const updatedState = req.user.userType == UserType.DELIVERY ? OrderService.deliveryUpdate(state) : OrderService.providerUpdate(state)
        const updatedOrder = await OrderService.callbackOrderUpdate(req.user, order, updatedState)
        res.status(StatusCode.SUCCESSFUL).json(updatedOrder)
    })

    // @desc    Cancel order by id
    // @route   PUT /api/order/:orderId/cancel
    // @access  Provider and Consumer
    static cancelOrder = expressAsyncHandler(async (req, res) => {
        const order = await OrderService.getOrderByUser(req.user, req.params.orderId)
        const state = {
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod
        }
        const updatedState = req.user.userType == UserType.PROVIDER ? OrderService.providerCancel(state) : OrderService.consumerCancel(state)
        const updatedOrder = await OrderService.callbackOrderUpdate(req.user, order, updatedState)
        res.status(StatusCode.SUCCESSFUL).json(updatedOrder)
    })

    // @desc    Pay order by id
    // @route   PUT /api/order/:orderId/pay
    // @access  Provider and Consumer
    static payOrder = expressAsyncHandler(async (req, res) => {
        const order = await OrderService.getOrderByUser(req.user, req.params.orderId)
        const state = {
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod
        }
        const updatedState = req.user.userType == UserType.PROVIDER ? OrderService.providerPay(state) : OrderService.consumerPay(state)
        const updatedOrder = await OrderService.callbackOrderUpdate(req.user, order, updatedState)
        res.status(StatusCode.SUCCESSFUL).json(updatedOrder)
    })
}
