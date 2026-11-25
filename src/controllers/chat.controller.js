import { GoogleGenAI } from "@google/genai";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { ApiResponse } from "../utils/apiResponseHandler.js";
import { Chat } from "../models/chat.model.js";
import { ConversetionHistory } from "../models/coversetionHistory.model.js";
import { User } from "../models/user.model.js";
const client = new GoogleGenAI();
import fs from 'fs'


const generateMessage=AsyncHandler(async(req,res)=>{
    const {prompt,HistoryId} = req.body
    if(!prompt){
        throw new ApiError(400,"Prompt is required")
    }
     let allConversetionHistory=[]
    if(HistoryId){
        const ChatHistory =await ConversetionHistory.findById(HistoryId).populate("chat")
      allConversetionHistory=ChatHistory.chat.map(item=>({
      type: item.role === "gemini" ? "model_output" : "user_input",
       content: [{ type: "text", text: item.text }],
    }))}
    allConversetionHistory.push({
       type: "user_input",
          content: [{ type: "text", text: prompt }],
    })
  
    const interaction = await client.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: allConversetionHistory,
      system_instruction: "Your name is MindMate AI and developed by roman.",
     generation_config: {
        thinking_level: "low"
    }
    });
    if(!interaction){
        throw new ApiError(500,"Failed to generate AI response",)
    }
    const aiReply=interaction.output_text
    
    const data = await Chat.create([
           { role: "user", text: prompt },
          { role: "gemini", text: aiReply },
    ])
    const messageIds=[data[0]._id, data[1]._id]
    let History;
    if(HistoryId){
      const ChatHistory = await ConversetionHistory.findOne({
    _id: HistoryId,
    user: req.user._id
});
    
if(!ChatHistory){
    throw new ApiError(400,"Conversetion not found")
}
       History = await ConversetionHistory.findByIdAndUpdate(
            HistoryId,
            {$push:{chat:{$each:messageIds}}},
            {new:true}
        ) 
      
    }
    else{
         History=await ConversetionHistory.create({
        title:prompt.slice(0,20),
        user:req.user._id,
        chat: [data[0]._id, data[1]._id]
    })
    }
    return res.status(200)
    .json(new ApiResponse(200,{history:History,Message:data},"AI replying.."))
})

const getConversetions=AsyncHandler(async(req,res)=>{
  const Conversetions = await ConversetionHistory
    .find({ user: req.user._id })
    .sort({ updatedAt: -1 }).populate("chat");
    if(!Conversetions){
        throw new ApiError(400,"Fail to fetch history")
    }
   
    return res.status(200)
    .json(new ApiResponse(200,Conversetions,"All history fetched successfully"))
})
const deleteConversetion=AsyncHandler(async(req,res)=>{
    const {ConversetionId}=req.params
    if(!ConversetionId){
        throw new ApiError(400,"Conversetion id not found")
    }
      const conversetion = await ConversetionHistory.findOne({
       _id:ConversetionId,
        user:req.user._id
      })
    
     if (!conversetion) {
        throw new ApiError(404, "Conversation not found");
    }

    await Chat.deleteMany({
        _id: { $in: conversetion.chat }
    });

    await ConversetionHistory.findByIdAndDelete(ConversetionId);
    res.status(200)
    .json(new ApiResponse(200,[],"Conversetion deleted successfully"))
})

const getConversetionById=AsyncHandler(async(req,res)=>{
    const {conversetionId}=req.params

    if(!conversetionId.trim()){
        throw new ApiError(400,"Conversetion id not found")
    }

    const conversetion=await ConversetionHistory.findOne({
       _id:conversetionId,
       user:req.user._id
    }).populate("chat")
    if(!conversetion){
        throw new ApiError(400,"Conversetion not found")
    }

    return res.status(200)
    .json(new ApiResponse(200,conversetion,"Conversetion fetched successfully"))
})

export {generateMessage,getConversetions,deleteConversetion,getConversetionById}