const User = require('../models/user')
const {body, validationResult} = require('express-validator')


//GET All USERS
exports.all_users_GET = async (req, res, next) => {
    try {
        const users = await User.find({})

        return res.status(200).json({users});
    }catch(err){
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
                                // .populate('posts')   Commented this line out because the Post model has not been created when testing userController and will return error
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

//SEND FRIEND REQUEST
exports.friend_request_POST = async(req, res, next) => {
    try {
        if(req.body.id === req.payload.id){
            res.status(400).json({message: 'You cannot send a friend request to yourself'});
            next()
        }
        const user = await User.findById(req.body.id);

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

        const updatedUser = User.findById(req.body.id)
                                .select('-password')
                                .select('-friend_requests')
                                .populate('friends')
                                .exec();

        return res.status(200).json({
                message: 'Friend request sent successfully',
                user: updatedUser
            })
    }catch(error){
        res.status(500).json({message: error.message});
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
        const updatedUserFriendReqs = user.friend_requests.filter(friendId => friendId !== req.body.id);
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
exports.reject_request_DELETE =(req, res, next)=> {
    
}

//UPDATE USER 
exports.update_user_PUT =(req, res, next) =>{

}
