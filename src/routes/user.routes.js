import { registerUser,loginUser,logoutUser,updatePassword, deleteUser } from "../controllers/user.controller.js";
import { app } from "../app.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import express from 'express'

const router =express.Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/change-password").patch(verifyJwt,updatePassword)
router.route("/delete-user").delete(verifyJwt,deleteUser)


export{router}