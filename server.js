import express from 'express'
import cors from 'cors'

import { SERVER_PORT } from './constants.js'
import userRoutes from './routes/userRoutes.js'
import platformRoutes from './routes/platformRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import deliveryJobRoutes from './routes/deliveryJobRoutes.js'
import { MiddlewareService } from './services/middlewareService.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
        origin: true,
        credentials: true
    })
)

app.use('/api/user', userRoutes)
app.use('/api/platform', platformRoutes)
app.use('/api/product', productRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/delivery-job', deliveryJobRoutes)

app.use(MiddlewareService.notFound)
app.use(MiddlewareService.errorHandler)

app.get('/', (req, res) => {
    res.send('Get request')
})

app.listen(SERVER_PORT, console.log(`Server running on port ${SERVER_PORT} ...`))
