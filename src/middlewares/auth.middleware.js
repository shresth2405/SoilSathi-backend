import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { Gardener } from '../models/Gardener.models.js'

export const verifyJWT = async(req , _ , next)=>{
    try{
        console.log(req.header("Authorization"));
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.SECRET)
    
        const user = await Gardener.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    }catch(e){
        throw new ApiError(500, "Something went wrong");
    }
}