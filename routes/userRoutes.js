import { Router } from 'express'
import { UserController } from '../controllers/userController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = Router()

router
    .route('/')
    .post(UserController.registerUser)
    .get(MiddlewareService.authorize, UserController.getUserDetails)
    .put(MiddlewareService.authorize, UserController.updateUserDetails)

router.post('/auth', UserController.loginUser)

export default router
