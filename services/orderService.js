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

    static providerUpdate(state) {
        switch (state.orderStatus) {
            case OrderStatus.PLACED:
                if (
                    (state.paymentMethod == PaymentMethod.CASH_ON_DELIVERY && state.paymentStatus == PaymentStatus.PAYMENT_INIT) ||
                    (state.paymentMethod == PaymentMethod.ONLINE_TRANSACTION && state.paymentStatus == PaymentStatus.PAYMENT_CONFIRMED)
                )
                    return { ...state, orderStatus: OrderStatus.CONFIRMED }
                throw Error(`Cannot confirm order with payment method ${state.paymentMethod} and payment status ${state.paymentStatus}.`)
            case OrderStatus.CONFIRMED:
                return { ...state, orderStatus: OrderStatus.PICKUP }
            default:
                throw Error(`Provider cannot update from order status ${state.orderStatus}.`)
        }
    }

    static deliveryUpdate(state) {
        switch (state.orderStatus) {
            case OrderStatus.PICKUP:
                return { ...state, orderStatus: OrderStatus.SHIPPED }
            case OrderStatus.SHIPPED:
                return { ...state, orderStatus: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAYMENT_CONFIRMED }
            case OrderStatus.TAKE:
                return { ...state, orderStatus: OrderStatus.RETURNED }
            case OrderStatus.RETURNED:
                return OrderService.orderCancelUpdate(state)
            default:
                throw Error(`Cannot update from order status ${state.orderStatus}.`)
        }
    }

    static providerCancel(state) {
        switch (state.orderStatus) {
            case OrderStatus.PLACED:
                return OrderService.orderCancelUpdate(state)
            default:
                throw Error(`Cannot cancel from order status ${state.orderStatus}.`)
        }
    }

    static consumerCancel(state) {
        switch (state.orderStatus) {
            case OrderStatus.PLACED:
            case OrderStatus.CONFIRMED:
            case OrderStatus.PICKUP:
                return OrderService.orderCancelUpdate(state)
            case OrderStatus.SHIPPED:
                return { ...state, orderStatus: OrderStatus.RETURNED }
            case OrderStatus.DELIVERED:
                return { ...state, orderStatus: OrderStatus.TAKE }
            default:
                throw Error(`Cannot cancel from order status ${state.orderStatus}.`)
        }
    }

    static providerPay(state) {
        switch (state.paymentStatus) {
            case PaymentStatus.REFUND_PROCESSING:
                return { ...state, paymentStatus: PaymentStatus.REFUND_CONFIRMED, orderStatus: OrderStatus.CANCELLED }
            default:
                throw Error(`Cannot pay from payment status ${state.paymentStatus}.`)
        }
    }

    static consumerPay(state) {
        switch (state.paymentStatus) {
            case PaymentStatus.PAYMENT_PROCESSING:
                return { ...state, paymentStatus: PaymentStatus.PAYMENT_CONFIRMED }
            default:
                throw Error(`Cannot pay from payment status ${state.paymentStatus}.`)
        }
    }
}
