const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile_photo_url: {
        type: String,
    },
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        } 
    ],
    friend_requests: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
})

UserSchema.virtual('url').get(() =>{
    return `api/users/${this._id}`;
})

module.exports = mongoose.model('User', UserSchema);