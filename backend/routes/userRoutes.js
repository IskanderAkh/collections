import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getAllUsers, getSuggestedUsers, getUserProfile, updateUser, handleUserAction, getUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post('/update/:id', protectRoute, updateUser);
router.get('/all', getAllUsers);
router.get('/user/:id', protectRoute, getUser);
router.post('/action', handleUserAction); 

export default router;
