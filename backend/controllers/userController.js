import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from 'cloudinary';
import Collection from "../models/collectionModel.js";
import Post from "../models/postModel.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getAllUsers", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user)
  } catch (error) {
    console.log("Error in getUser", error.message);
    res.status(500).json({ error: error.message });
  }
}
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }
        }
      },
      { $sample: { size: 10 } }
    ]);

    const suggestedUsers = users.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.params.id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "Please provide both current password and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    const oldUsername = user.username;

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;

    if (oldUsername !== username) {
      await Collection.updateMany({ userId }, { $set: { author: username } });
      await Post.updateMany({ user: userId }, { $set: { author: username } });
    }
    // console.log(username);
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const handleUserAction = async (req, res) => {
  const { userId, action } = req.body;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    switch (action) {
      case 'block':
        user.access = 'blocked';
        break;
      case 'unblock':
        user.access = 'viewer';
        break;
      case 'delete':
        await Post.deleteMany({ user: userId });
        await Collection.deleteMany({ userId: userId });
        await User.findByIdAndDelete(userId);
        return res.status(200).json({ message: "User and their posts and collections deleted successfully" });
      case 'makeAdmin':
        user.access = "admin";
        break;
      case 'removeAdmin':
        user.access = 'viewer';
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in handleUserAction: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

