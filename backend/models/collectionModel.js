import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    author:{
        type: String,
        required: true
    },
    postsId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    customFields: {
        integerFields: [{ name: String }],
        stringFields: [{ name: String }],
        textFields: [{ name: String }],
        booleanFields: [{ name: String }],
        dateFields: [{ name: String }],
    }
}, {timestamps: true});

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
