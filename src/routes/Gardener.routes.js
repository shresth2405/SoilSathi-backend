import { Router } from "express";
import { addDeviceId, createGardener, loginGardener } from "../controllers/Gardener.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/create').post(createGardener);
router.route('/login').post(loginGardener);
router.route('/addDevice').post(verifyJWT,addDeviceId);


export default router;