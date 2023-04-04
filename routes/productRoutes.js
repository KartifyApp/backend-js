import { Router } from 'express'
import { ProductController } from '../controllers/productController.js'
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

export default router
