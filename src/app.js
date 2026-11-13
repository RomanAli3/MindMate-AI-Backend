import express, { urlencoded } from 'express'
import dotenve from 'dotenv'
import cookieParser from 'cookie-parser'

const app=express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

dotenve.config({
    path:"./.env"
})
app.use(cookieParser())
import { router } from './routes/user.routes.js'
app.use("/user",router)
export {app}