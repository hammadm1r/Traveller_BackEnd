const User = require("../models/User");
const { success,error } = require("../utils/responseWrapper");
const Post = require("../models/Post");
const { mapPostOutput } = require("../utils/utils");
const { post } = require("../routers/postsRouter");
const cloudinary = require('cloudinary').v2;

const followOrUnfollowUserController = async (req , res) =>{
    try {
    const {userIdToFollow} = req.body;
    const curUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const curUser= await User.findById(curUserId)
    if(curUserId == userIdToFollow){
        return res.send(error(409,'User cannot follow themself'))
    }
    if(!userToFollow){
        return res.send(error(404,'User To Follow not Found'));
    }
    //Already Followed
    if (curUser.followings.includes(userIdToFollow)) { 
        const followingindex = curUser.followings.indexOf(userIdToFollow);
        curUser.followings.splice(followingindex,1);

        const followerindex = userToFollow.followers.indexOf(curUser);
        userToFollow.followers.splice(followingindex,1);



    }else{
        userToFollow.followers.push(curUserId);
        curUser.followings.push(userIdToFollow);

    }
    await userToFollow.save();
    await curUser.save();
    return res.send(success(200,{user:userToFollow}));
    } catch (err) {
        return res.send(error(500,err.message));
    }
    
}
const getPostOfFollowing = async (req,res) =>{

    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);
        const posts = await Post.find({
        'owner':{
            $in:curUser.followings
        }
    })
    return res.send(success(200,posts));
    } catch (err) {
        return res.send(error(500,err));
    }
    
}

const getFeedData = async (req,res) =>{

    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId).populate('followings');
        const fullPosts = await Post.find({
        owner:{
            $in:curUser.followings
        },
    }).populate('owner');
    const  posts= fullPosts.map(item => mapPostOutput(item,req._id) ).reverse();
    const followingIds = curUser.followings.map(item => item._id);
    followingIds.push(req._id);
    const suggestions = await User.find({
        _id: {
            '$nin':followingIds
        }
    });
    return res.send(success(200,{...curUser._doc, suggestions,posts}));
    } catch (err) {
        return res.send(error(500,err));
    }
    
}

const getMyPostController = async (req,res) =>{ 
    try {
        const curUserId = req._id;
        const allUserPosts = await Post.find({
            owner:curUserId
        }).populate('likes');
        return res.send(success(200,{allUserPosts}));       
    } catch (err) {
        return res.send(error(500,err.message));
    }
}
    
const getUserPostController = async (req,res) =>{ 
    try {
        const userId = req.body.userId;
        if(!userId){
            return res.send(error(400,'User Id Required'))
        }
        const allUserPosts = await Post.find({
            owner:userId
        }).populate('likes');
        return res.send(success(200,{allUserPosts}));       
    } catch (err) {
        return res.send(error(500,err.message));
    }
}

const deleteMyProfile = async (req,res) =>{

    try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);
    //delete post related to the user
    await Post.deleteMany({
        owner : curUserId
    })

    // removed myself from follower's Followings
    curUser.followers.forEach(async (followerId) => {
        const follower = await User.findById(followerId);
        const index = follower.followings.indexOf(curUserId);
        follower.followings.splice(index,1);
        await follower.save();
    })

    //remove my self from my followings from Follower
    curUser.followings.forEach(async (followingId) => {
        const following = await User.findById(followingId);
        const index = following.followers.indexOf(curUserId);
        following.followers.splice(index,1);
        await following.save();
    })

    //remove my self from likes
    const allPosts = await Post.find();
    allPosts.forEach(async (post) => {
        const index = post.likes.indexOf(curUserId);
        post.likes.splice(index,1);
        await post.save();
    })
    // deleted User
    await curUser.remove();
    res.clearCookie('jwt',{
        httpOnly:true,
        secure:true,
    })
    return res.send(success(200,'User Deleted')); 
    } catch (err) {
         return res.send(error(500,err.message));
    }

    
}

const getMyInfo= async(req, res)=>{
    try {
        const user = await User.findById(req._id);
        return res.send(success(200,{user}));
    } catch (err) {
        return res.send(error(500,err.message));
    }
    
}

const updateUserProfile = async(req,res) =>{
    try {
        const {name,bio,userImg} = req.body;
        const curUserId = req._id;
        const user = await User.findById(curUserId);
        if(name){
            user.name=name;
        }
        if(bio){
            user.bio=bio;
        }
        if (userImg){
            const cloudImg = await cloudinary.uploader.upload(userImg,{
                folder: 'profileImg'
            })
            user.avatar = {
                url : cloudImg.secure_url,
                publicId:cloudImg.public_id
            }
        }
        await user.save();
        return res.send(success(200,{user}))
    } catch (err) {
        return res.send(error(500,err.message));
    } 
}
    const getUserProfile = async(req,res)=>{
        try {
            const userId = req.body.userId;
            console.log(userId);
            if (!userId) {
                return res.status(400).send({ success: false, message: "User ID is required" });
            }
            const user = await User.findById(userId).populate({
                path:'posts',
                populate:{
                    path:'owner'
                }}
            );
            const fullPosts = user.posts || [];
            console.log('1');
            const  posts= fullPosts.map(item => mapPostOutput(item,req._id) ).reverse();
            return res.send(success(200,{...user._doc,posts}));
        } catch (err) {
            return res.send(error(500,err.message));
        }

    }

module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPostController,
    getUserPostController,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile,
    getFeedData
};