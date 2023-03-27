import dotenv from 'dotenv'

dotenv.config()

export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_PORT = process.env.DB_PORT || 5432
export const DB_NAME = process.env.DB_NAME
export const DB_USER = process.env.DB_USER
export const DB_PASSWORD = process.env.DB_PASSWORD

export const SERVER_PORT = process.env.SERVER_PORT || 5000
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRE_TIME = '30d'
export const SALT_ROUNDS = 10
