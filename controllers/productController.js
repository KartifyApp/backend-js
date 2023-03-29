import expressAsyncHandler from 'express-async-handler'

import { StatusCode } from '../models/enumConstants.js'
import { ConstraintService } from '../services/constraintService.js'
import { ProductService } from '../services/productService.js'
import { UtilityService } from '../services/utilityService.js'

export class ProductController {
    // @desc    Create a product in a platform
    // @route   POST /api/product/
    // @access  Provider
    static createNewProduct = expressAsyncHandler(async (req, res) => {
        const productData = UtilityService.getValues(
            ['name', 'brand', 'category', 'platformId'],
            [
                ['image', ''],
                ['description', ''],
                ['price', 0],
                ['stockCount', 0]
            ],
            req.body
        )
        const platform = await ConstraintService.checkUserPlatform(req.user.userId, productData.platformId)
        await ConstraintService.checkProductCategory(platform, productData.category)
        const product = await ProductService.createProduct(productData)
        res.status(StatusCode.SUCCESSFUL).json(product)
    })
}
