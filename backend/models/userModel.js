import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    fullName:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    access: {
        type: String,
        require: true,
        default: 'viewer'
    }, coverImg: {
        type: String,
        default: ""
    },
    profileImg: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    userPosts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: []
        }
    ],
    link: {
        type: String,
        default: ""
    },



}, { timestamps: true })


const User = mongoose.model("User", userSchema)

export default User;