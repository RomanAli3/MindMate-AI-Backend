import {User} from '../models/user.model.js'
import { AsyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiErrorHandler.js'
import  jwt from 'jsonwebtoken'
import dotenv from 'dotenv'


const verifyJwt =AsyncHandler(async(req,res,next)=>{

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!token){
        throw new ApiError(401,"Unauthorized User")
    }
    const verifyToken= jwt.verify(token,process.env.ACCESS_TOKEN_KEY);
    if(!verifyToken){
        throw new ApiError(401,"Invalid token")
    }
    const user = await User.findById(verifyToken._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(401,"User not found")
    }
    req.user=user
    next()
})

export {verifyJwt}