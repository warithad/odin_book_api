const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {body, validationResult} = require('express-validator')
const User = require('../models/user')

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken =(user)=>{
    return jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '1d'});
}

const verifyPassword = async (password, user) => {
    return await bcrypt.compare(password, user.password)
}

// SIGN UP
exports.signup = [
    body('first_name', 'First name is required').trim().isLength({min: 1}).escape(),
    body('last_name', 'Last name is required').trim().isLength({min: 1}).escape(),
    body('email').isEmail().normalizeEmail().escape(),
    body('password', 'Password is required').trim().isLength({min: 1}).escape(),

    async (req, res, next) =>{
        const errors = validationResult(body);
        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()});
        }

        const {
               first_name, 
               last_name, 
               email, 
               password, 
               profile_photo_url
              } = req.body;

        const existingUser = await User.exists({email: email});
        
        if(existingUser == true){
            return res.status(409).json({message: 'User with email already exists'});
        }

        const hashedPassword =await bcrypt.hash(password, 10);
        const user = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            profile_photo_url: profile_photo_url ? profile_photo_url : '',
            friends: [],
            friend_requests: [],
            posts: []
        })
        try{
            await user.save();
            const token = generateToken(user);
            
            return res.status(201).json({
                message: 'Sign up successful',
                token,
                user: {
                    id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    profile_photo_url: user.profile_photo_url
                }
            });
        }catch(err){
            res.status(500).json({error: err.message});
            next(err);
        }
    }
]

//SIGN IN
exports.signin = [
    body('email', 'Email is Required').isEmail().normalizeEmail().escape(),
    body('password', 'Password is required').trim().isLength({min: 1}).escape(),

    async (req, res, next) => {
        const errors = validationResult(body);

        if(!errors.isEmpty()){
            return res.status(401).json({errors: errors.array()});
        }
        const {email, password} = req.body;
        try {

            const user = await User.findOne({email});

            if(!user){
                return res.status(401).json({message: 'Account does not exist'});
            }
            const isValidated = await verifyPassword(password, user);
            if(!isValidated){
                return res.status(401).json({message: 'Username or password is incorrect'})
            }
            const token = generateToken(user);

            return res.status(200).json({
                message: 'Sign in successful',
                token,
                user: {
                    id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    profile_photo_url: user.profile_photo_url
                }
            })
        }
        catch (error){
            res.status(500).json({message: error.message});
            next(error);
        }
    }
]