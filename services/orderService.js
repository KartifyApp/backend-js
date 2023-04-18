import { OrderStatus, PaymentMethod, PaymentStatus, TableNames, UserType } from '../models/enumConstants.js'
import { DBService } from './DBService.js'
import { DeliveryJobService } from './deliveryJobService.js'
import { PlatformService } from './platformService.js'
import { ProductService } from './productService.js'

export class OrderService {
    static async getOrderById(orderId) {
        const order = await DBService.getData(TableNames.ORDER, { orderId })
        if (order.length == 0) {
            throw Error(`No orderwith order ID ${orderId} exists.`)
        }
        return order[0]
    }

    static async createSafeOrder(orderData, cartProducts) {
        try {
            await DBService.beginTransaction()
            const createdOrder = await DBService.createData(TableNames.ORDER, orderData)
            createdOrder.orderProducts = await Promise.all(
                Object.entries(cartProducts).map(
                    async ([productId, quantity]) =>
                        await DBService.createData(TableNames.ORDER_PRODUCT, { productId, quantity, orderId: createdOrder.orderId })
                )
            )
            await DBService.commitTransaction()
            return createdOrder
        } catch (error) {
            await DBService.rollBackTransaction()
            throw Error(error.message)
        }
    }

    static async getOrderPrice(cartProducts) {
        const products = await Promise.all(
            Object.entries(cartProducts).map(async ([productId, quantity]) => ({
                ...(await ProductService.getProductById(productId)),
                quantity: quantity
            }))
        )
        if (new Set(products.map((product) => product.platformId)).size > 1) {
            throw Error(`All products are not from same platform.`)
        }
        return products.reduce((total, product) => total + product.price * product.quantity, 0)
    }

    static async getDeliveryOrders(userId) {
        const deliveryJobs = await DBService.getData(TableNames.DELIVERY_JOB, { userId })
        const orders = []
        for (const deliveryJob of deliveryJobs) {
            const deliveryOrders = await DBService.getData(TableNames.ORDER, { deliveryJobId: deliveryJob.deliveryJobId })
            orders.push(...deliveryOrders)
        }
        return orders
    }

    static async checkDeliveryUserOrder(userId, order) {
        const deliveryJob = await DBService.getData(TableNames.DELIVERY_JOB, { userId, platformId: order.platformId })
        if (deliveryJob.length == 0) {
            throw Error(`No delivery job for order ${order.orderId} exists for user ID ${userId}.`)
        }
        return deliveryJob
    }

    static async getOrderByUser(user, orderId) {
        const order = await OrderService.getOrderById(orderId)
        switch (user.userType) {
            case UserType.PROVIDER:
                await PlatformService.getUserPlatform(user.userId, order.platformId)
                break
            case UserType.CONSUMER:
                if (user.userId != order.userId) {
                    throw Error(`No order with ID ${orderId} exists for user ID${user.userId}.`)
                }
                break
            case UserType.DELIVERY:
                await DeliveryJobService.getUserDeliveryJob(user.userId, order.deliveryJobId)
                break
        }
        return order
    }

    static orderCancelUpdate(order) {
        switch (order.paymentStatus) {
            case PaymentStatus.PAYMENT_CONFIRMED:
                return { ...order, orderStatus: OrderStatus.RECEIVED, paymentStatus: PaymentStatus.REFUND_PROCESSING }
            case PaymentStatus.PAYMENT_INIT:
                return { ...order, orderStatus: OrderStatus.CANCELLED }
            default:
                throw Error(`Cannot cancel order from payment status ${order.paymentStatus}.`)
        }
    }

    static providerUpdate(order) {
        switch (order.orderStatus) {
            case OrderStatus.PLACED:
                if (
                    (order.paymentMethod == PaymentMethod.CASH_ON_DELIVERY && order.paymentStatus == PaymentStatus.PAYMENT_INIT) ||
                    (order.paymentMethod == PaymentMethod.ONLINE_TRANSACTION && order.paymentStatus == PaymentStatus.PAYMENT_CONFIRMED)
                )
                    return { ...order, orderStatus: OrderStatus.CONFIRMED }
                throw Error(`Cannot confirm order with payment method ${order.paymentMethod} and payment status ${order.paymentStatus}.`)
            case OrderStatus.CONFIRMED:
                return { ...order, orderStatus: OrderStatus.PICKUP }
            default:
                throw Error(`Provider cannot update from order status ${order.orderStatus}.`)
        }
    }

    static deliveryUpdate(order) {
        switch (order.orderStatus) {
            case OrderStatus.PICKUP:
                return { ...order, orderStatus: OrderStatus.SHIPPED }
            case OrderStatus.SHIPPED:
                return { ...order, orderStatus: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAYMENT_CONFIRMED }
            case OrderStatus.TAKE:
                return { ...order, orderStatus: OrderStatus.RETURNED }
            case OrderStatus.RETURNED:
                return OrderService.orderCancelUpdate(order)
            default:
                throw Error(`Cannot update from order status ${order.orderStatus}.`)
        }
    }

    static providerCancel(order) {
        switch (order.orderStatus) {
            case OrderStatus.PLACED:
                return OrderService.orderCancelUpdate(order)
            default:
                throw Error(`Cannot update cancel order status ${order.orderStatus}.`)
        }
    }

    static consumerCancel(order) {
        switch (order.orderStatus) {
            case OrderStatus.CONFIRMED:
            case OrderStatus.PICKUP:
                return OrderService.orderCancelUpdate(order)
            case OrderStatus.SHIPPED:
                return { ...order, orderStatus: OrderStatus.RETURNED }
            case OrderStatus.DELIVERED:
                return { ...order, orderStatus: OrderStatus.TAKE }
        }
    }

    static providerPay(order) {
        switch (order.paymentStatus) {
            case PaymentStatus.REFUND_PROCESSING:
                return { ...order, paymentStatus: PaymentStatus.REFUND_CONFIRMED }
            default:
                throw Error(`Cannot pay from payment status ${order.paymentStatus}.`)
        }
    }

    static consumerPay(order) {
        switch (order.paymentStatus) {
            case PaymentStatus.PAYMENT_PROCESSING:
                return { ...order, paymentStatus: PaymentStatus.PAYMENT_CONFIRMED }
            default:
                throw Error(`Cannot pay from payment status ${order.paymentStatus}.`)
        }
    }
}
