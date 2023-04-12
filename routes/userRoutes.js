import { Router } from 'express'
import { DeliveryJobController, UserController } from '../controllers/userController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = Router()

router
    .route('/')
    .post(UserController.registerUser)
    .get(MiddlewareService.authorize, UserController.getUserDetails)
    .put(MiddlewareService.authorize, UserController.updateUserDetails)

router.post('/auth', UserController.loginUser)

router
    .route('/delivery')
    .get(MiddlewareService.authorize, MiddlewareService.providerUser, DeliveryJobController.getAllDeliveryJobs)
    .post(MiddlewareService.authorize, MiddlewareService.providerUser, DeliveryJobController.createNewDeliveryJob)

router
    .route('/delivery/:deliveryJobId')
    .get(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, DeliveryJobController.getDeliveryJobDetails)
    .put(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, DeliveryJobController.updateDeliveryJobDetails)
    .delete(MiddlewareService.authorize, MiddlewareService.providerAndDeliveryUser, DeliveryJobController.deleteDeliveryJob)

export default router
