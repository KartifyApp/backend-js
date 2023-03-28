import express from 'express'
import { PlatformController } from '../controllers/platformController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = express.Router()

router
    .route('/')
    .get(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.getAllPlatforms)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.createNewPlatform)

router.route('/:platformId').get(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.getPlatform).put().delete()

export default router
