import mongoose, {Schema} from "mongoose"

const SensorSchema = new Schema({
    deviceId:{
        type: String,
        required: true,
    },
    temperature:{
        type: Number,
        default: 0
    },
    humidity:{
        type: Number,
        default: 0
    },
    Nitrogen:{
        type: Number,
        default: 0
    },
    Potassium:{
        type:Number,
        default: 0
    },
    Phosphorus:{
        type: Number,
        default: 0
    },
    pH:{
        type: Number,
        default: 0
    }, 
    RainFall:{
        type: Number,
        default: 0
    }
},{
    timestamps:true,
})

export const Sensor = mongoose.model("Sensor", SensorSchema);
