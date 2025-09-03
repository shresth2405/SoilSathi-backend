import mongoose from "mongoose";


export async function connectDB(){
    try{
        const mongoInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`Database is connected at port:${mongoInstance.connection.host}`);
    }catch(e){
        console.error('Error:',e);
        process.exit(1);
    }
}

