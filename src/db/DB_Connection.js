import mongoose from 'mongoose'

const connectDB=()=>{

    mongoose.connect(process.env.MONGODB_URI,)
    .then(()=>console.log("Connnection Established!"))
    .catch((error)=>console.log("error",error))
}

export{connectDB}