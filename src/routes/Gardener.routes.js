import { Router } from "express";
import { addDeviceId, createGardener, loginGardener } from "../controllers/Gardener.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/create').post(createGardener);
router.route('/login').post(loginGardener);
router.route('/addDevice').post(verifyJWT,addDeviceId);
router.get("/protected", verifyJWT, (req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route!",
    user: req.user, // this comes from verifyJWT middleware
  });
});


export default router;