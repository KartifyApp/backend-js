import express from 'express'
import cors from 'cors'

import { SERVER_PORT } from './constants.js'
import userRoutes from './routes/userRoutes.js'
import platformRoutes from './routes/platformRoutes.js'
import productRoutes from './routes/productRoutes.js'
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

app.use(MiddlewareService.notFound)
app.use(MiddlewareService.errorHandler)

const PORT = SERVER_PORT

app.get('/', (req, res) => {
    res.send('Get request')
})

app.listen(PORT, console.log(`Server running on port ${PORT} ...`))
