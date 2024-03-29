import { OrderStatus, TableNames } from '../models/enumConstants.js'
import { DBService } from './DBService.js'
import { PlatformService } from './platformService.js'

export class ProductService {
    static async getProductById(productId) {
        const products = await DBService.getData(TableNames.PRODUCT, { productId: productId })
        if (products.length == 0) {
            throw Error(`No product with productId ${productId} exists.`)
        }
        return products[0]
    }

    static async getUserProduct(userId, productId) {
        const product = await ProductService.getProductById(productId)
        await PlatformService.getUserPlatform(userId, product.platformId)
        return product
    }

    static async checkProductCategory(platform, category) {
        if (!platform.categories.includes(category)) {
            throw Error(`Platform does not have ${category} category.`)
        }
        return true
    }

    static async updateProductStockCount(orderId, orderStatus) {
        const orderProducts = await DBService.getData(TableNames.PRODUCT_JOIN_ORDER_PRODUCT, { orderId })
        if (orderStatus == OrderStatus.CONFIRMED || orderStatus == OrderStatus.CANCELLED) {
            return await Promise.all(
                orderProducts.map(
                    async (orderProduct) =>
                        await DBService.updateData(
                            TableNames.PRODUCT,
                            {
                                stockCount:
                                    orderStatus == OrderStatus.CONFIRMED
                                        ? orderProduct.stockCount - orderProduct.quantity
                                        : orderProduct.stockCount + orderProduct.quantity
                            },
                            orderProduct.productId
                        )
                )
            )
        }
        return null
    }
}

export class ProductReviewService {
    static async getUserProductReview(userId, productReviewId) {
        const productReviews = await DBService.getData(TableNames.PRODUCT_REVIEW, {
            userId: userId,
            productReviewId: productReviewId
        })
        if (productReviews.length === 0) {
            throw Error(`No product review with productReviewId ${productReviewId} exists for userId ${userId}.`)
        }
        return productReviews[0]
    }
}
