import { Router } from 'express'
import { ProductController, ProductReviewController } from '../controllers/productController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = Router()

router
    .route('/')
    .get(MiddlewareService.authorize, ProductController.getAllProducts)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, ProductController.createNewProduct)

router
    .route('/review')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, ProductReviewController.getAllProductReviews)
    .post(MiddlewareService.authorize, MiddlewareService.consumerUser, ProductReviewController.createNewProductReview)

router
    .route('/:productId')
    .get(MiddlewareService.authorize, ProductController.getProductDetails)
    .put(MiddlewareService.authorize, MiddlewareService.providerUser, ProductController.updateProductDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.providerUser, ProductController.deleteProduct)

router
    .route('/review/:productReviewId')
    .get(MiddlewareService.authorize, MiddlewareService.consumerUser, ProductReviewController.getProductReviewDetails)
    .put(MiddlewareService.authorize, MiddlewareService.consumerUser, ProductReviewController.updateProductReviewDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.consumerUser, ProductReviewController.deleteProductReview)

export default router
