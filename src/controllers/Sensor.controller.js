import { Sensor } from "../models/SensorReading.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const SetDataFromEsp32 = async (req, res) => {
    const { deviceId, temperature, humidity, soilMoisture, Nitrogen, Phosphorus, Potassium, pressure, altitude, pH } = req.body;
    if (!deviceId) {
        throw new ApiError(400, "Device ID is required");
    }

    const data = await Sensor.create({
        deviceId,
        temperature: temperature || 0,
        humidity: humidity || 0,
        soilMoisture: soilMoisture || 0,
        Nitrogen: Nitrogen || 0,
        Phosphorus: Phosphorus || 0,
        Potassium: Potassium || 0,
        pressure: pressure || 0,
        altitude: altitude || 0,
        pH: pH || 0
    });
    console.log(data);

    if (!data) {
        throw new ApiError(500, "Data couldnot be saved");
    }

    return res.status(201).json(
        new ApiResponse(201, data, "Data saved successfully")
    )
}

export const getData = async (req, res) => {
    const { deviceId } = req.params;
    if (!deviceId) {
        throw new ApiError(400, "Device ID is required");
    }

    const data = await Sensor.find({ deviceId }).sort({ createdAt: -1 }).limit(1);
    if (!data || data.length === 0) {
        throw new ApiError(404, "No data found for this device");
    }

    return res.status(200).json(
        new ApiResponse(200, data[0], "Data fetched successfully")
    );
}