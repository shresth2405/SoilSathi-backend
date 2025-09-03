import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const GardenerSchema = new Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    deviceId: {
        type: String,
        // required: true,
    },
    City:{
        type: String,
        required: true,
    },
    plants:[
        {
            type:String,
        }
    ],
    
})

GardenerSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next()
}) 


GardenerSchema.methods.isPasswordCorrect=async function (password){
    const result=await bcrypt.compare(password, this.password)
    return result
}



GardenerSchema.methods.generateToken = async function(){
    // console.log(this._id);
    return jwt.sign(
        {
        _id: this._id,
        name:this.name,
        password: this.password
        },
        process.env.SECRET,
        {expiresIn: '10d'}
    )
}


export const Gardener = mongoose.model('Gardener', GardenerSchema);