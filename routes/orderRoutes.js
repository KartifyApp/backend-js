import { Router } from 'express'
import { MiddlewareService } from '../services/middlewareService'

const router = Router()

router.route('/').get(MiddlewareService.authorize, MiddlewareService.providerAndConsumerUser).post(MiddlewareService.authorize, MiddlewareService.consumerUser)

export default router
