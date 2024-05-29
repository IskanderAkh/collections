import mongoose from "mongoose";
import Collection from "../models/collectionModel.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
	try {
		const { text, collectionName, tags, title, userId, customFields, addedByAdmin, author } = req.body;
		let { img } = req.body;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!author) author = user.username;

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		let collection = await Collection.findOne({ name: collectionName });
		if (!collection) {
			return res.status(400).json({ error: "Collection not found" });
		} else {
			collection.customFields = customFields;
		}

		const newPost = new Post({
			user: userId,
			author: user.username,
			text,
			collectionName,
			img,
			tags,
			title,
			customFields,
			addedByAdmin: addedByAdmin || false ,
			collectionId: collection._id
		});

		collection.postsId.push(newPost._id);
		await collection.save();
		await newPost.save();

		if (!user.userPosts) {
			user.userPosts = [];
		}
		user.userPosts.push(newPost._id);
		await user.save();

		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const searchPosts = async (req, res) => {
	try {
		const { query, category } = req.query;
		if (!query) {
			return res.status(400).json({ error: "Query parameter is required" });
		}

		let searchCriteria = {};

		const searchRegex = new RegExp(query, 'i');

		switch (category) {
			case 'tags':
				searchCriteria = { tags: { $regex: searchRegex } };
				break;
			case 'collectionName':
				searchCriteria = { collectionName: { $regex: searchRegex } };
				break;
			case 'title':
			default:
				searchCriteria = { title: { $regex: searchRegex } };
				break;
		}

		const posts = await Post.find(searchCriteria)
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in searchPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString() && req.user.access !== 'admin') {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		const collection = await Collection.findOneAndUpdate(
			{ userId: post.user, name: post.collectionName },
			{ $pull: { postsId: post._id } },
			{ new: true }
		);

		if (collection && collection.postsId.length === 0) {
			await Collection.findByIdAndDelete(collection._id);
		} else if (!collection) {
			console.log("Collection not found for post:", post._id);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);
   console.log(post);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: `Internal server error ${error}` });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, tags, title, customFields } = req.body;
    let { img } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString() && req.user.access !== 'admin') {
      return res.status(401).json({ message: "You are not authorized to update this post" });
    }

    console.log("Post ID before update:", post._id);

    post.text = text || post.text;
    post.tags = tags || post.tags;
    post.title = title || post.title;
    post.customFields = customFields || post.customFields;
    post.img = img || post.img;

    const updatedPost = await post.save();

    console.log("Post ID after update:", updatedPost._id);

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in updatePost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

