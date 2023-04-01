import { ProductClient } from '../clients/productClient.js'
import { PlatformService } from './platformService.js'

export class ProductService {
    static async checkUserProduct(userId, productId) {
        const product = await ProductClient.getProductById(productId)
        if (!product) {
            throw Error(`No product with productId ${productId} exists.`)
        }
        await PlatformService.checkUserPlatform(userId, product.platformId)
        return product
    }

    static async checkProductCategory(platform, category) {
        if (!platform.categories.includes(category)) {
            throw Error(`Platform does not have ${category} category.`)
        }
        return true
    }
}
