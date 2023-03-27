import express from 'express'
import cors from 'cors'

import { SERVER_PORT } from './constants.js'
import userRoutes from './routes/userRoutes.js'

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

const PORT = SERVER_PORT

app.get('/', (req, res) => {
    res.send('Get request')
})

app.listen(PORT, console.log(`Server running on port ${PORT} ...`))
