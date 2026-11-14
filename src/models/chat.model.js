import mongoose from 'mongoose'

const chatSchema=mongoose.Schema({
    role:{
        type:String,
        enum:["user","gemini"],
        required:true
    },
    text:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Chat = mongoose.model("Chat",chatSchema)