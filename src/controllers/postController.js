const Post = require('../models/post')
const Comment = require('../models/comment')
const User = require('../models/user')
const {body, check, validationResult} = require('express-validator')


//Gets posts GET
exports.get_posts_POST = async (req, res, next) =>{
       
}

// GETS SPECIFIC POST
exports.post_GET = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
                                        .populate('comments')
                                        .exec();
        const user = await User.findById(req.payload.id);
        
        if(!post) {
            return res.status(404).json({message: 'Post not Found'})
        }
        if(post.author != req.payload.id && !user.friends.includes(post.author)){
            return res.status(401).json({message: 'You are not friends with the author of this post'})
        }

        return res.status(200).json({post});
    }catch(error){
        return res.status(500).json({error: error.message})
    }
}

// CREATE NEW POST
exports.create_post_POST =(req, res, next)=> [
    body('content').trim().isLength({min: 1}).escape(),
    check('image_urls*').isLength({min: 1}),

    async (req, res, next) =>{
        const bodyerrs = validate(body)
        const checkErrs = validate(check)

        const errs = [...bodyerrs, ...checkErrs]
        if(!errs.isEmpty()){
            res.status(400).json({errors: errs.array()})
            next()
        }
        const { content, image_urls } = req.body;
        try {
            const post = new Post({
                author: req.payload.id,
                content,
                image_urls,
                comments: [],
                likes: [],
            });
            //Save post and add post.id to user's posts
            await post.save();
            const savedPost  = await Post.findById(post.id).populate('author', '-password');
            
            const user = await User.findById(req.payload.id);
            const updatedPosts = [...user.posts, savedPost._id]

            user.posts = updatedPosts;
            await user.save();

            //Return saved post and success message
            return res.status(200).json({
                message: 'Post created successfully',
                post: savedPost
            })
        } catch (error) {
            return res.status(500).json({error: error.message})
        }
    }
]

//Delete post DELETE
exports.post_delete_DELETE = async (req, res, next) => {
    
    try {
        const post = await Post.findById(req.params.postId);
        const user = await User.findById(req.payload.id);
        if(!post){
            return res.status(404).json({message: 'Post does not exist'})
        }
        
        if(post.author != req.payload.id || !user.posts.includes(req.params.postId)){
            return res.status(401).json({message: 'You are not permitted to delete this post'})
        }

        
        const updatedUser = await User.findByIdAndUpdate(
                                                        req.payload.id, 
                                                        { $pull: {posts: req.params.postId} }, {new: true}
                                                        ).exec();
        const updatedPost = await Post.findByIdAndDelete(req.params.postId);
        return res.status(200).json({
            message: 'Post deleted successfully',
            post: updatedPost
        })
    } catch (error) {
        console(error.message);
        return res.status(500).json({error: error.message})
    }

    
}

//Like & Unlike post PUT 
exports.like_post_PUT = async(req, res, next) =>{
    const {postId} = req.params;

    try {
        const post = await Post.findById(postId);

        if(post.likes.includes(req.payload.id)){
           const updatedPost =  await Post.findByIdAndUpdate(postId, {$pull: {likes: req.payload.id}})
                                                            .populate('author', '-password -friend_requests')
                                                            .exec();
            return res.status(200).json({
                                    message: 'Post unliked successfully',
                                    post: updatedPost
                                })
        } else {
            const updatedPost =  await Post.findByIdAndUpdate(postId, {$push: {likes:{_id: req.payload.id}}})
                                                            .populate('author', '-password -friend_requests')
                                                            .exec();
            return res.status(200).json({
                                        message: 'Post liked successfully',
                                        post: updatedPost
                                        })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({error: error.message})
    }
}

//Add comment POST
exports.add_comment_POST = [
    body('content').trim().isLength({min: 1}).escape(),

    async (req, res, next) => {
        const errs = validate(body);
        if(!errs.isEmpty()){
            res.status(400).json({erros: errs.array()})
            next();
        }
        const {content} = req.body;
        try {
            const comment = new Comment({
                content,
                author: req.payload.id,
                post: req.params.postId,
                likes: []
            })

            const savedComment = await comment.save();
            const post = await Post.findById(req.params.id);
            const updatedComments = [...post.comments, savedComment._id];
            post.comments = updatedComments

            await post.save();

            return res.status(200).json({
                message: 'Comment added successfully',
                comment: savedComment
            })
        } catch (error) {
            return res.status(500).json({error: error.message})
        }
    }
]

//Remove comment DELETE
exports.delete_comment_DELETE = async (req, res, next) =>{
    const {commentId} = req.params;

    try {
        const comment = await Comment.findById(commentId);
        if(req.payload.id != comment.author){
            res.status(400).json({message: 'You are not permitted to delete this comment'})
            next();
        }

        const post = await Post.findById(comment.post);
        if(!post.comments.includes(commentId)){
            res.status(400).json({message: 'Comment does not exist'});
        }

        const updatedComments = post.comments.filter(com => com != commentId);
        post.comments = updatedComments;

        await post.save();

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({
            message: 'Comment deleted successfully',
            comment: deletedComment
        })
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

//Like and Unlike Comment 
exports.like_comment_PUT = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if(!comment){
            return res.status(404).json({message: 'Comment not Found'})
        }
        if(comment.likes.includes(req.payload.id)){
            const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, {$pull : {likes: {_id: req.payload.id}}})
                                                .populate('author', '-password -friend_requests')
                                                .exec();
        
            return res.status(200).json({
                message: 'Comment unliked successfully',
                comment: updatedComment
            })
        }
        else {
            const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, {$push: {likes: {_id: req.payload.id}}})
                                                .populate('author', '-password -friend_requests')
                                                .exec();

            return res.status(200).json({
                message: 'Comment unliked successfully',
                comment: updatedComment
            })
        }
    } 
    catch(e){
        return res.status(500).json({error: e.message})
    }
}