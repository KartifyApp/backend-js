import { Router } from 'express'
import { PlatformController, PlatformReviewController } from '../controllers/platformController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = Router()

router
    .route('/')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, PlatformController.getAllPlatforms)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.createNewPlatform)

router
    .route('/review')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser, PlatformReviewController.getAllPlatformReviews)
    .post(MiddlewareService.authorize, MiddlewareService.consumerUser, PlatformReviewController.createNewPlatformReview)

router
    .route('/:platformId')
    .get(MiddlewareService.authorize, PlatformController.getPlatformDetails)
    .put(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.updatePlatformDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.deletePlatform)

router
    .route('/review/:platformReviewId')
    .get(MiddlewareService.authorize, MiddlewareService.consumerUser, PlatformReviewController.getPlatformReviewDetails)
    .put(MiddlewareService.authorize, MiddlewareService.consumerUser, PlatformReviewController.updatePlatformReviewDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.consumerUser, PlatformReviewController.deletePlatformReview)

export default router
