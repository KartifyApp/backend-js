import { TableNames } from '../models/enumConstants.js'
import { DBService } from './DBService.js'
import { ProductService } from './productService.js'

export class OrderService {
    static async createSafeOrder(orderData, orderProductsData) {
        try {
            await DBService.beginTransaction()
            const createdOrder = await DBService.createData(TableNames.ORDER, orderData)
            createdOrder.orderProducts = await Promise.all(
                orderProductsData.map(
                    async (orderProductData) => await DBService.createData(TableNames.ORDER_PRODUCT, { ...orderProductData, orderId: createdOrder.orderId })
                )
            )
            await DBService.commitTransaction()
            return createdOrder
        } catch (error) {
            await DBService.rollBackTransaction()
            throw Error(error.message)
        }
    }

    static async getOrderPrice(orderProductsData) {
        const products = await Promise.all(
            orderProductsData.map(async (orderProductData) => ({
                ...(await ProductService.getProductById(orderProductData.productId)),
                quantity: orderProductData.quantity
            }))
        )
        if (new Set(products.map((product) => product.platformId)).size > 1) {
            throw Error(`All products are not from same platform.`)
        }
        return products.reduce((total, product) => total + product.price * product.quantity, 0)
    }
}
