import { Router } from 'express'
import { ProductController, ProductReviewController } from '../controllers/productController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = Router()

router
    .route('/')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, ProductController.getAllProducts)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, ProductController.createNewProduct)

router
    .route('/:productId')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, ProductController.getProductDetails)
    .put(MiddlewareService.authorize, MiddlewareService.providerUser, ProductController.updateProductDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.providerUser, ProductController.deleteProduct)

router
    .route('/:productId/review')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, ProductReviewController.getAllProductReviews)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, ProductReviewController.createNewProductReview)

router
    .route('/:productId/review/:productReviewId')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, ProductReviewController.getProductReviewDetails)
    .put(MiddlewareService.authorize, MiddlewareService.providerUser, ProductReviewController.updateProductReviewDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.providerUser, ProductReviewController.deleteProductReview)

export default router
