import { Gardener } from "../models/Gardener.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateTokens = async (gardenerId) => {
    try {
        const gardener = await Gardener.findById(gardenerId).select('-plants');
        const token = await gardener.generateToken();
        if (!token) {
            throw new ApiError(400, "Token could not be generated");
        }
        return token;
    } catch (e) {
        throw new ApiError(500, `Error generating token: ${e.message}`);
    }
};

export const createGardener = async (req, res) => {
    const { username, email, password, deviceId } = req.body;
    const existingdevice = await Gardener.findOne({ email: email });
    if (existingdevice) {
        throw new ApiError(400, "Email already exists");
    }

    const gardener = await Gardener.create({ 
        name: username,
        email,
        password,
        deviceId
    });

    if (!gardener) {
        throw new ApiError(400, "Gardener is not created");
    }

    return res.status(201).json(
        new ApiResponse(201, gardener, "Gardener created successfully")
    );
};

export const loginGardener = async (req, res) => {
    const { email, password, deviceId } = req.body;
    const device = await Gardener.findOne({ email }).select('+password');

    const checkpassword = await device.isPasswordCorrect(password)
    if (!checkpassword) {
        throw new ApiError(401, "Password is incorrect")
    }

    if (!device) {
        throw new ApiError(400, "User does not exist");
    }

    // console.log(device._id);

    const token = await generateTokens(device._id);

    const options = {
        httpOnly: true,
        secure: true,
    };
    console.log("Login successful");

    return res.status(200)
        .cookie('token', token, options)
        .json(
            new ApiResponse(200, device, "Device logged in successfully")
        );
};

export const addDeviceId = async (req, res) => {
    try {
        const userId = req.user?._id;

        const {deviceId} = req.body; 

        const gardener = await Gardener.findById(userId);


        // Find gardener by email

        // Check if deviceId already exists
        if (gardener.deviceId && gardener.deviceId === deviceId) {
            return res.status(200).json(
                new ApiResponse(200, gardener, "DeviceId already linked with this gardener")
            );
        }

        // Update gardener with new deviceId
        gardener.deviceId = deviceId;
        await gardener.save({validateBeforeSave: false});

        return res.status(200).json(
            new ApiResponse(200, gardener, "DeviceId added successfully")
        );
    } catch (e) {
        throw new ApiError(500, `Error adding DeviceId: ${e.message}`);
    }
};
