import { Router } from 'express'
import { PlatformController } from '../controllers/platformController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = Router()

router
    .route('/')
    .get(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.getAllPlatforms)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.createNewPlatform)

router
    .route('/:platformId')
    .get(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.getPlatform)
    .put(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.updatePlatformData)
    .delete(MiddlewareService.authorize, MiddlewareService.providerUser, PlatformController.deletePlatform)

export default router
