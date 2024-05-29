import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: "https://res.cloudinary.com/dw9ayz9hr/image/upload/v1715506849/No-Image-Placeholder_hyzkk9.png"
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    comments: [
        {
            text: { type: String, required: true },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
        }
    ],
    collectionName: {
        type: String,
        required: true,
    },
    tags: {
        type: String,
        required: true
    },
    addedByAdmin: {
        type: Boolean,
        default: false
    },
    author: {
        type: String,
        required: true
    },
    collectionId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection"
        }
    ]
},
    { timestamps: true })

const Post = mongoose.model("Post", postSchema)

export default Post