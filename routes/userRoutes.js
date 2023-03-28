import express from 'express'
import { UserController } from '../controllers/userController.js'

const router = express.Router()

router.route('/').post(UserController.registerUser)
router.post('/login', UserController.loginUser)

export default router