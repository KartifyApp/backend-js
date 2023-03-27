import pg from 'pg'
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../constants.js'

const client = new pg.Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
})
client.connect()

export { client }
