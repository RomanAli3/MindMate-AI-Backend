import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,"Please enter a valid email address"],
         unique:[true,"Email is already registered"]
    },
    userName:{
        type:String,
        required:[true,"Username is required"],
        unique:[true,"Username already existe"],
        lowercase:true
    },
    name:{
         type:String,
        required:[true,"name is required"],
    },
    refreshToken:{
        type:String
    },
    password:{
        type:String,
        minlength:[8,"Password must be 8 characters"],
        required:[true,"Password is required"],
    }
},{timestamps:true})

userSchema.pre("save",async function(){
    if(!this.isModified("password")) return
    const hashPassword =await bcrypt.hash(this.password,10)
    this.password =hashPassword
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        name:this.name
    },
    process.env.ACCESS_TOKEN_KEY,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRE
    }
)}

userSchema.methods.generateRefreshToken=function() {
    return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_KEY,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRE
    }
)}
export const User =mongoose.model("User",userSchema)