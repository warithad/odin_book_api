const User = require('../models/user')
const Comment = require('../models/comment')
const Post = require('../models/post')
const {body, validationResult} = require('express-validator')


//GET All USERS
exports.all_users_GET = async (req, res, next) => {
    try {
        const users = await User.find({})

        return res.status(200).json({users});
    }catch(err){
        console.log(err)
        res.status(500).json({message: err.message});
        return next(err);
    }
}

//GET SPECIFIC USER
exports.get_user_GET = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
                                .select('-password')
                                .select('-friend_requests')
                                .populate('friends')
                                .populate('posts')
                                .exec();

        if(!user){
           return res.status(404).json({message: 'User Not Found'});
        }

        return res.status(200).json({user});
    }catch(err){
        res.status(500).json({message: err.message});
        return next(err);
    }
}

//DELETE USER ACCOUNT
exports.delete_user_DELETE = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.payload.id);

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        const deletedPosts = await Post.deleteMany({author: req.payload.id})
        const deletedComments = await Comment.deleteMany({author: req.payload.id});

        return res.status(200).json({message: 'User deleted successfully'})
    }catch(err){
        return res.status(500).json({error: err.message})
    }
}

//SEND FRIEND REQUEST
exports.friend_request_POST = async(req, res, next) => {
    const reqUser = req.body.id;
    try {
        if(reqUser === req.payload.id){
           return res.status(400).json({message: 'You cannot send a friend request to yourself'});
        }
        const user = await User.findById(reqUser);

        if(!user){
           return res.status(404).json({message: 'User not found'});

        }
        if(user.friends.includes(req.payload.id)){
            return res.status(409).json({message: 'You are already friends with this user'})
        }

        if(user.friend_requests.includes(req.payload.id)){
            return res.status(409).json({message: 'You already sent a friend request to this user'})
        }
        const updatedfriendRequests = [...user.friend_requests, req.payload.id]; 

        user.friend_requests = updatedfriendRequests;

        await user.save();

        const updatedUser = await User.findById(req.body.id)
                                .select('-password')
                                .select('-friend_requests')
                                .populate('friends', '-password -friend_reqeuests')
                                .exec();
    
        return res.status(200).json({
                message: 'Friend request sent successfully',
                user: updatedUser
            })
    }catch(error){
       res.status(500).json({error: error.message});
       next();
    }
}

//ACCEPT FRIEND REQUEST
exports.accept_request_PUT = async (req, res, next) => {
    try {
        const friend = await User.findById(req.body.id);
        const user = await User.findById(req.payload.id);
        
        if(!friend){
            return res.status(404).json({message: 'User not found'});
        }

        if(friend.friends.includes(req.payload.id)){
            return res.status(409).json({message: 'You are already friends with this user'})
        }
        if(!user.friend_requests.includes(req.body.id)){
           return res.status(400).json({message: 'Friend request from user not found'})
        }
        
        //Add user's id to friend's friend array and save
        const updatedFriends = [...friend.friends, req.payload.id]; 
        friend.friends = updatedFriends;
        await friend.save();


        //Add friend's id to user's friend array and save
        const updatedUserFriendReqs = user.friend_requests.filter(friendId => friendId != req.body.id);
        const updatedUserFriends = [...user.friends, req.body.id];
        
        user.friend_requests = updatedUserFriendReqs;
        user.friends = updatedUserFriends;

        await user.save();

        const updatedUser = await User.findById(req.payload.id)
                                .select('-password')
                                .populate('friends')
                                .populate('friend_requests')
                                .exec();

        return res.status(200).json({
            message: 'Friend request accepted successfully',
            user: updatedUser
        })
    }catch(error){
        res.status(500).json({message: error.message})
        next();
    }
}

//REJECT FRIEND REQUEST
exports.reject_request_DELETE = async (req, res, next)=> {
    const reqId = req.params.id;

    try {
        const friend = await User.findById(reqId);
        if(!friend){
            res.status(404).json({message: 'User not found'});
            next();
        }

        const user = await User.findById(req.payload.id);
        const updatedfriendRequests = user.friend_requests.filter(fr => fr != reqId);
        console.log(updatedfriendRequests)  
        await User.findByIdAndUpdate(req.payload.id, {friend_requests: updatedfriendRequests});

        const updated = await User.findById(req.payload.id);
        return res.status(200).json({
            message: 'Friend request rejected successfully',
            user: updated
        })
    } catch (error) {
        console.log(error.message);
       return res.status(500).json({error: error.message}); 
    }

}

//UPDATE USER 
exports.update_user_PUT =(req, res, next) =>{

}

