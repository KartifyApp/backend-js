import { Router } from 'express'
import { MiddlewareService } from '../services/middlewareService.js'
import { DeliveryJobController } from '../controllers/deliveryJobController.js'

const router = Router()

router
    .route('/')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, DeliveryJobController.getAllDeliveryJobs)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, DeliveryJobController.createNewDeliveryJob)

router
    .route('/:deliveryJobId')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, DeliveryJobController.getDeliveryJobDetails)
    .put(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, DeliveryJobController.updateDeliveryJobDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, DeliveryJobController.deleteDeliveryJob)

export default router
