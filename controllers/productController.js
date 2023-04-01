import expressAsyncHandler from 'express-async-handler'

import { StatusCode } from '../models/enumConstants.js'
import { ConstraintService } from '../services/constraintService.js'
import { ProductService } from '../services/productService.js'
import { UtilityService } from '../services/utilityService.js'

export class ProductController {
    // @desc    Get all products of a platform
    // @route   GET /api/product/
    // @access  Provider
    static getAllProducts = expressAsyncHandler(async (req, res) => {
        const productData = UtilityService.getValues(['platformId'], [['category', null]], req.query)
        await ConstraintService.checkUserPlatform(req.user.userId, productData.platformId)
        const products = await ProductService.getPlatformProducts(productData.platformId, productData.category)
        res.status(StatusCode.SUCCESSFUL).json(products)
    })

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

    // @desc    Get a product
    // @route   GET /api/product/:productId
    // @access  Provider
    static getProduct = expressAsyncHandler(async (req, res) => {
        const product = await ConstraintService.checkUserProduct(req.user.userId, req.params.productId)
        res.status(StatusCode.SUCCESSFUL).json(product)
    })

    // @desc    Update a product
    // @route   PUT /api/product/:productId
    // @access  Provider
    static updateProductData = expressAsyncHandler(async (req, res) => {
        var product = await ConstraintService.checkUserProduct(req.user.userId, req.params.productId)
        var productData = UtilityService.getValues(
            [],
            [
                ['name', product.name],
                ['image', product.image],
                ['brand', product.brand],
                ['category', product.category],
                ['description', product.description],
                ['price', product.price],
                ['stockCount', product.stockCount]
            ],
            req.body
        )
        productData.productId = product.productId
        const platform = await ConstraintService.checkUserPlatform(req.user.userId, product.platformId)
        await ConstraintService.checkProductCategory(platform, productData.category)
        product = await ProductService.updateProduct(productData)
        res.status(StatusCode.SUCCESSFUL).json(product)
    })
}
