import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { commentPost, createPost, deletePost, getAllPosts, getUserPosts, likeUnlikePost, searchPosts, updatePost } from "../controllers/postController.js";

const router = express.Router();


router.post("/create", protectRoute, createPost)
router.delete('/:id', protectRoute, deletePost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.get("/all", getAllPosts)
router.post("/comment/:id", protectRoute, commentPost)
router.get("/user/:username", protectRoute, getUserPosts)
router.get("/search", searchPosts); 
router.put("/:id", protectRoute, updatePost);



export default router