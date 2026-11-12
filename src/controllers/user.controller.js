import {User} from '../models/user.model.js'
import {AsyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiErrorHandler.js'
import {ApiResponse} from '../utils/apiResponseHandler.js'
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.EMIAL_URI,
    pass: process.env.EMIAL_URI_PASSWORD,
  },
});

async function sendMail(to,sub,msg){
    await transporter.sendMail({
        to:to,
        subject:sub,
        html:msg
    })
}
const options={
      httpOnly:true,
    secure:false
}

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user= await User.findById(userId)
        if(!user){
            throw new ApiError(400,"User not found")
        }
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(400,error)
    }
}

const welcomeEmail = (name) => {
    return `
        <div style="background:#f3f6fc;padding:30px;font-family:Arial">
            <div style="max-width:600px;margin:auto;background:white;border-radius:12px;overflow:hidden">

                <div style="background:#101c36;padding:30px;text-align:center">

                    // <!-- LOGO: Baad mein apna logo yahan add karna -->

                    <h1 style="color:white">
                        MindMate <span style="color:#60a5fa">AI</span>
                    </h1>

                    <p style="color:#b8c7df">
                        Your Smart AI Thinking Partner
                    </p>
                </div>

                <div style="padding:30px">

                    <h2 style="color:#172554">
                        Welcome aboard, ${name}!
                    </h2>

                    <p style="color:#475569;line-height:1.8">
                        We're excited to have you as part of the MindMate AI community.
                        Your account has been successfully created.
                    </p>

                    <h3 style="color:#172554">What can you do?</h3>

                    <ul style="color:#475569;line-height:2">
                        <li>Get answers to your questions.</li>
                        <li>Explore new ideas.</li>
                        <li>Learn new concepts.</li>
                        <li>Keep your conversations organized.</li>
                    </ul>

                    <p style="color:#475569">
                        Thank you for choosing MindMate AI!
                    </p>

                    <h3 style="color:#2563eb">
                        The MindMate AI Team
                    </h3>
                </div>

                <div style="background:#f8fafc;padding:20px;text-align:center">
                    <p style="color:#94a3b8;font-size:12px">
                        © 2026 MindMate AI. All rights reserved.
                    </p>
                </div>

            </div>
        </div>
    `;
};

const registerUser=AsyncHandler(async(req,res)=>{
    const {userName,email,password,name} =req.body
    if(!userName.trim()||!email.trim()||!password.trim()||!name.trim()){
        throw new ApiError(400,"Please fill all fields")
    }
    const existedUser=await User.findOne({
        $or:[
            {email},
            {userName}
        ]
    })
    if(existedUser){
        throw new ApiError(400,"User already existed change username or email")
    }
    const user =await User.create({
        userName,
        email,
        password,
        name
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiResponse(501,"Error while regestering user")
    }
    await sendMail(
        email,
        "Welcome to MindMate AI!",
        welcomeEmail(name)
        
    )
    return res.status(201)
    .json(new ApiResponse(201,createdUser,"User created successfully"))
})

const loginUser=AsyncHandler(async(req,res)=>{
    const {userName,email,password}=req.body
    if(!(userName||email)){
        throw new ApiError(400,"Please enter username or email")
    }
    if(!password){
        throw new ApiError(400,"Enter your password")
    }
    const existedUser=await User.findOne({
        $or:[
            {email},
            {userName}
        ]})
        
    if(!existedUser){
        throw new ApiError(401,"User not found")
    }
    const passwordCheck=await existedUser.isPasswordCorrect(password)
    if(!passwordCheck){
        throw new ApiError(401,"Invalid password")
    }
   const {refreshToken,accessToken}=await generateAccessAndRefreshToken(existedUser._id)
   const logedInUser=await User.findById(existedUser._id).select("-password -refreshToken")
   if(!logedInUser){
    throw new ApiError(500,"User does not login ! try again")
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(new ApiResponse(200,logedInUser,"User loged in successfully"))
})

const logoutUser=AsyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{refreshToken:1}
        },
        {new:true}
    )
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logout successfully"))

})

const updatePassword=AsyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    if(!oldPassword.trim()||!newPassword.trim()){
        throw new ApiError(400,"All fields are required")
    }
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User not found")
    }
    const verifyPassword =await user.isPasswordCorrect(oldPassword)
    if(!verifyPassword){
        throw new ApiError(401,"Invalid old password")
    }
    const updatedUser=await User.findByIdAndUpdate(
        user._id,
        {$set:{password:newPassword}},
            { new: true }
    ).select("-password -refreshToken")

    res.status(200)
    .json(new ApiResponse(200,updatedUser,"Password is updated"))
})

export {registerUser,loginUser,logoutUser,updatePassword}