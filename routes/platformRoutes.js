import express from 'express'
import { createNewPlatform } from '../controllers/platformController.js'
import { MiddlewareService } from '../services/middlewareService.js'

const router = express.Router()

router.route('/').post(MiddlewareService.authorize, MiddlewareService.providerUser, createNewPlatform)

export default router
