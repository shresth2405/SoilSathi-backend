import { Router } from "express";
import { SetDataFromEsp32, getData } from "../controllers/Sensor.controller.js";

const router = Router();

router.route('/setData').post(SetDataFromEsp32);
router.route('/getData/:deviceId').get(getData);

export default router;