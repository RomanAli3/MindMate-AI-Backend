import { generateMessage } from "../controllers/chat.controller.js"
import express from 'express'
import { verifyJwt } from "../middlewares/auth.middleware.js"

const geminiRouter =express.Router()

geminiRouter.route("/chat").post(verifyJwt,generateMessage)

export {geminiRouter} 