import mongoose, { mongo } from 'mongoose'

const conversetionHistory=mongoose.Schema({
    title:{
        type:String,
        required:true,
        default:"New Chat"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    chat:[
      {  type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
}]
},{timestamps:true})

export const CoversetionHistory=mongoose.model("CoversetionHistory",conversetionHistory)