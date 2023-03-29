import { Router } from 'express'
import { UserController } from '../controllers/userController.js'

const router = Router()

router.route('/').post(UserController.registerUser)
router.post('/login', UserController.loginUser)

export default router
