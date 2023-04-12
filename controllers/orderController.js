import expressAsyncHandler from 'express-async-handler'
import { UtilityService } from '../services/utilityService'

export class OrderController {
    // @desc    Create a order
    // @route   POST /api/order/
    // @access  Consumer
    static createOrder = expressAsyncHandler(async (req, res) => {
        const orderData = UtilityService.getValues()
    })
}
