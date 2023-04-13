import expressAsyncHandler from 'express-async-handler'

import { StatusCode, TableNames, UserType } from '../models/enumConstants.js'
import { UtilityService } from '../services/utilityService.js'
import { PlatformService } from '../services/platformService.js'
import { ProductReviewService, ProductService } from '../services/productService.js'
import { DBService } from '../services/DBService.js'

export class ProductController {
    // @desc    Get all products of a platform
    // @route   GET /api/product/
    // @access  Provider and Consumer
    static getAllProducts = expressAsyncHandler(async (req, res) => {
        const productData = UtilityService.getValues(['platformId'], [], req.query)
        if (req.query.category) productData.category = req.query.category
        if (req.user.userType == UserType.PROVIDER) {
            await PlatformService.getUserPlatform(req.user.userId, productData.platformId)
        }
        const products = await DBService.getData(TableNames.PRODUCT, productData)
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
        const platform = await PlatformService.getUserPlatform(req.user.userId, productData.platformId)
        await ProductService.checkProductCategory(platform, productData.category)
        const product = await DBService.createData(TableNames.PRODUCT, productData)
        res.status(StatusCode.SUCCESSFUL).json(product)
    })

    // @desc    Get a product
    // @route   GET /api/product/:productId
    // @access  Provider and Consumer
    static getProductDetails = expressAsyncHandler(async (req, res) => {
        const product =
            req.user.userType == UserType.PROVIDER
                ? await ProductService.getUserProduct(req.user.userId, req.params.productId)
                : await ProductService.getProductById(req.params.productId)
        res.status(StatusCode.SUCCESSFUL).json(product)
    })

    // @desc    Update a product
    // @route   PUT /api/product/:productId
    // @access  Provider
    static updateProductDetails = expressAsyncHandler(async (req, res) => {
        const product = await ProductService.getUserProduct(req.user.userId, req.params.productId)
        const productData = UtilityService.getUpdateValues(['name', 'image', 'brand', 'category', 'description', 'price', 'stockCount'], product, req.body)
        if (productData.category) {
            const platform = await PlatformService.getUserPlatform(req.user.userId, product.platformId)
            await ProductService.checkProductCategory(platform, productData.category)
        }
        const updatedProduct = await DBService.updateData(TableNames.PRODUCT, productData, product.productId)
        res.status(StatusCode.SUCCESSFUL).json(updatedProduct)
    })

    // @desc    Delete a product
    // @route   DELETE /api/product/:productId
    // @access  Provider
    static deleteProduct = expressAsyncHandler(async (req, res) => {
        const product = await ProductService.getUserProduct(req.user.userId, req.params.productId)
        const deletedProduct = await DBService.deleteData(TableNames.PRODUCT, product.productId)
        res.status(StatusCode.SUCCESSFUL).json(deletedProduct)
    })
}

export class ProductReviewController {
    // @desc    Get all reviews of a product
    // @route   GET /api/product/review
    // @access  Provider and Consumer
    static getAllProductReviews = expressAsyncHandler(async (req, res) => {
        if (req.user.userType == UserType.PROVIDER) {
            const productReviewData = UtilityService.getValues(['productId'], [], req.query)
            await ProductService.getUserProduct(req.user.userId, productReviewData.productId)
            const productReviews = await DBService.getData(TableNames.PRODUCT_REVIEW, productReviewData)
            res.status(StatusCode.SUCCESSFUL).json(productReviews)
        } else {
            const productReviews = await DBService.getData(
                TableNames.PRODUCT_REVIEW,
                req.query.productId ? { productId: req.query.productId } : { userId: req.user.userId }
            )
            res.status(StatusCode.SUCCESSFUL).json(productReviews)
        }
    })

    // @desc    Create a product review
    // @route   POST /api/product/review
    // @access  Consumer
    static createNewProductReview = expressAsyncHandler(async (req, res) => {
        const productReviewData = UtilityService.getValues(['comment', 'rating', 'productId'], [], req.body)
        productReviewData.userId = req.user.userId
        const productReview = await DBService.createData(TableNames.PRODUCT_REVIEW, productReviewData)
        res.status(StatusCode.SUCCESSFUL).json(productReview)
    })

    // @desc    Get a product review
    // @route   GET /api/product/review/:productReviewId
    // @access  Consumer
    static getProductReviewDetails = expressAsyncHandler(async (req, res) => {
        const productReview = await ProductReviewService.getUserProductReview(req.user.userId, req.params.productReviewId)
        res.status(StatusCode.SUCCESSFUL).json(productReview)
    })

    // @desc    Update product review
    // @route   PUT /api/product/review/:productReviewId
    // @access  Consumer
    static updateProductReviewDetails = expressAsyncHandler(async (req, res) => {
        const productReview = await ProductReviewService.getUserProductReview(req.user.userId, req.params.productReviewId)
        const productReviewData = UtilityService.getUpdateValues(['comment', 'rating'], productReview, req.body)
        const updatedProductReview = await DBService.updateData(TableNames.PRODUCT_REVIEW, productReviewData, productReview.productReviewId)
        res.status(StatusCode.SUCCESSFUL).json(updatedProductReview)
    })

    // @desc    Delete a product Review
    // @route   DELETE /api/product/review/:productReviewId
    // @access  Consumer
    static deleteProductReview = expressAsyncHandler(async (req, res) => {
        const productReview = await ProductReviewService.getUserProductReview(req.user.userId, req.params.productReviewId)
        const deletedProductReview = await DBService.deleteData(TableNames.PRODUCT_REVIEW, productReview.productReviewId)
        res.status(StatusCode.SUCCESSFUL).json(deletedProductReview)
    })
}
