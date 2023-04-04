import { TableNames } from '../models/enumConstants.js'
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
}

export class ProductReviewService {
    static async getUserProductReview(userId, productId, productReviewId) {
        const productReviews = await DBService.getData(TableNames.PRODUCT_REVIEW, {
            userId: userId,
            productId: productId,
            productReviewId: productReviewId
        })
        if (productReviews.length === 0) {
            throw Error(`No product review with productReviewId ${productReviewId} exists for userId ${userId} and productId ${productId}.`)
        }
        return productReviews[0]
    }
}
