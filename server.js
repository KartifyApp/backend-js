import express from 'express'
import cors from 'cors'
import { SERVER_PORT } from './constants.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
        origin: true,
        credentials: true
    })
)

const PORT = SERVER_PORT

app.get('/', (req, res) => {
    res.send('Get request')
})

app.listen(PORT, console.log(`Server running on port ${PORT} ...`))
