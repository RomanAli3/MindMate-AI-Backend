import express from 'express'
import dotenve from 'dotenv'
const app=express()
dotenve.config({
    path:"./.env"
})
app.use(cookieParser())

export {app}