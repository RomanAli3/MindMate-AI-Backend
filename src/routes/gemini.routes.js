import { createImage, deleteConversetion, generateMessage, getConversetions } from "../controllers/chat.controller.js"
import express from 'express'
import { verifyJwt } from "../middlewares/auth.middleware.js"

const geminiRouter =express.Router()

geminiRouter.route("/chat").post(generateMessage)
geminiRouter.route("/genrate-image").post(createImage)

geminiRouter.route("/get-history").get(verifyJwt,getConversetions)

geminiRouter.route("/delete-history/:ConversetionId").delete(verifyJwt,deleteConversetion)
export {geminiRouter} 