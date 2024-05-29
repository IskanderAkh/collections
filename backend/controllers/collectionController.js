import Collection from "../models/collectionModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllCollections = async (req, res) => {
	try {
		const collections = await Collection.find()
			.sort({ createdAt: -1 })
		if (collections.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(collections);
	} catch (error) {
		console.log("Error in getAllCollections controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const deleteCollection = async (req, res) => {
	try {
		const collection = await Collection.findById(req.params.id);
		const collectionId = req.params.id;

		if (!collection) {
			return res.status(404).json({ error: "Collection not found" });
		}
		
		const posts = await Post.find({ _id: { $in: collection.postsId } });
		const defaultPosts = posts.filter(post => post.default == true);
		const nonDefaultPosts = posts.filter(post => !post.default);
		collection.postsId = nonDefaultPosts.map(post => post._id);
		
		await collection.save();
		await Post.deleteMany({ _id: { $in: nonDefaultPosts.map(post => post._id) } });
		
		await Collection.findByIdAndDelete(collectionId);

		console.log(`Collection ${collectionId} and its non-default posts were deleted.`);
		res.status(200).json({ message: "Collection and its non-default posts were deleted" });
	} catch (error) {
		console.log("Error in deleteCollection function: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const createCollection = async (req, res) => {
	const { name, userId, customFields, author, postsId } = req.body;
	console.log(postsId);
	try {
		const existingCollection = await Collection.findOne({ name });
		if (existingCollection) {
			return res.status(400).json({ error: "Collection with this name already exists" });
		}

		let newCollection = new Collection({ name, postsId: [postsId], userId, customFields, author });

		await newCollection.save();

		res.status(201).json(newCollection);
	} catch (error) {
		console.log("Error in createCollection controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const createCollectionWithPost = async (req, res) => {
	try {
		const { name, text, collectionName, tags, title, userId, customFields, addedByAdmin, author } = req.body;
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

		let collection = await Collection.findOne({ name: name });
		if (collection) {
			return res.status(400).json({ error: "Collection with this name already exists" });
		}
		
		collection = new Collection({
			name,
			postsId: [],
			userId,
			customFields,
			author
		});
		await collection.save();

		const newPost = new Post({
			user: userId,
			author: user.username,
			text,
			collectionName,
			img,
			tags,
			title,
			customFields,
			collectionId: collection._id,
			addedByAdmin: addedByAdmin || false
		});

		await newPost.save();
		collection.postsId.push(newPost._id);
		await collection.save();

		if (!user.userPosts) {
			user.userPosts = [];
		}
		user.userPosts.push(newPost._id);
		await user.save();

		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: `Internal server error: ${error}` });
		console.log("Error in createCollectionWithPost controller: ", error);
	}
};
