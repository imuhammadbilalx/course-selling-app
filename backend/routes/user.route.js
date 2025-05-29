import express from "express"
import { signup } from "../controllers/user.controller.js";
import { login } from "../controllers/user.controller.js";
import { logout } from "../controllers/user.controller.js";
import { purchases } from "../controllers/user.controller.js";
import userMiddleware from "../middlewares/user.mid.js";


const router =express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/purchases",userMiddleware, purchases);

export default router;  
