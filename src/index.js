import { app } from "./app.js";
import { connectDB } from "./db/DB_Connection.js";
connectDB()
app.listen(process.env.PORT,()=>{
    console.log("App is Listening on ",process.env.PORT)
})