import { GoogleGenAI } from "@google/genai";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { ApiResponse } from "../utils/apiResponseHandler.js";
import { Chat } from "../models/chat.model.js";
import { CoversetionHistory } from "../models/coversetionHistory.model.js";
import { User } from "../models/user.model.js";
const client = new GoogleGenAI({});

const generateMessage=AsyncHandler(async(req,res)=>{
    const {prompt,HistoryId} = req.body
    if(!prompt){
        throw new ApiError(400,"Prompt is required")
    }
    const interaction = await client.interactions.create({
      model: "gemini-4-hydrogen",
      input: prompt,
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
        History = await CoversetionHistory.findByIdAndUpdate(
            HistoryId,
            {$push:{chat:{$each:messageIds}}},
            {new:true}
        )
    }
    else{
         History=await CoversetionHistory.create({
        title:prompt.slice(0,20),
        user:req.user._id,
        chat: [data[0]._id, data[1]._id]
    })
    }
    return res.status(200)
    .json(new ApiResponse(200,{history:History,Message:data},"AI replying.."))
})
export {generateMessage}