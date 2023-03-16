const {faker} = require('@faker-js/faker')
const User = require('../models/user')


const users = []

const generateUser =()=> {
    const user = new User({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        profile_photo_url: faker.image.imageUrl(),
        password: "sadfasdfnasdkf",
        friends: [],
        friend_requests: [],
        posts: []
    })
    users.push(user);
}

const generateUsers=()=> {
    for(let i = 0; i < 10; i++){
        generateUser();
    }
}

const generateFriends=()=>{
    const temp = users.slice(1, 6);
    temp.forEach(t => users[0].friends.push(t._id));
}


const seedTests =async ()=>{
    
    generateUsers();
    generateFriends();

    for(let i = 0; i < users.length; i++){
        try {
           await users[i].save();
        } catch (error) {
            console.log(error.message);
        }
    }
    return users;
}

module.exports = seedTests;
