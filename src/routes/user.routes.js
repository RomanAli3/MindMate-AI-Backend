import { registerUser,loginUser,logoutUser,updatePassword } from "../controllers/user.controller";
import { app } from "../app";
import { verifyJwt } from "../middlewares/auth.middleware";

