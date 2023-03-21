const {faker} = require('@faker-js/faker')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')

const users = []
const posts = []
const comments = []

const shuffleArray = (relArr) => {
    const array = [...relArr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

const generateUser =()=> {
    const user = new User({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        profile_photo_url: faker.image.imageUrl(),
        password: faker.internet.password(),
        friends: [],
        friend_requests: [],
        posts: []
    })
    users.push(user);
}

const generatePost =(user)=> {
    const post = new Post({
        author: user,
        content: faker.lorem.sentence(6),
        image_urls: [
                        faker.image.imageUrl(),
                        faker.image.imageUrl(),
                        faker.image.imageUrl()
                    ],
        comments: [],
        likes: []
    })
    posts.push(post);
    user.posts.push(post._id);
}

const addPostToUsers =()=>{
    users.forEach(user =>{
        for(let i = 0; i < Math.floor(Math.random() * 5); i++){
            generatePost(user);
        }
    });
}

const addCommentsToPosts =()=>{
  posts.forEach((post) => {
    post.author.friends.forEach((friend) => {
      const comment = new Comment({
        author: friend._id,
        content: faker.lorem.sentence(),
        post: post._id,
        likes: [],
      });
      comments.push(comment);
      post.comments.push(comment._id);
    });
  });
}

const likePosts =()=> {
    posts.forEach((post) => {
        post.author.friends.forEach((friend) => {
          if (Math.random() > 0.6) {
            post.likes.push(friend._id);
          }
        });
    });
}

const likeComments = () => {
  posts.forEach((post) => {
    post.comments.forEach((comment) => {
      const relComment = comments.find((comm) => comm._id === comment);
      post.author.friends.forEach((user) => {
        relComment.likes.push(user._id);
      });
    });
  });
};

const generateUsers=()=> {
    for(let i = 0; i < 10; i++){
        generateUser();
    }
}

const generateFriends=()=>{
    users.forEach((user) => {
        "user: ", user._id;
        const usersExcCurrentUser = users.filter((item) => item._id != user._id);
        const shuffledUsers = shuffleArray(usersExcCurrentUser);
        const randSlicedUsers = shuffledUsers.slice(0, 1);
        "sliced random users: ", randSlicedUsers;
    
        user.friends = randSlicedUsers.map((user) => user._id);
        "user's friends: ", user.friends;
    
        user.friends.forEach((friendedUser) => {
          const relIndex = users.findIndex((user) => user._id == friendedUser);
    
          if (!users[relIndex].friends.includes(user._id)) {
            users[relIndex].friends.push(user._id);
          }
        });
      });
}


const seedTests =async ()=>{
    
    generateUsers();
    generateFriends();
    addPostToUsers();
    likePosts();
    addCommentsToPosts();
    likeComments();

    for (user of users) {
      try {
        await user.save();
      } catch (e) {
        e;
      }
    }
  
    for (post of posts) {
      try {
        await post.save();
      } catch (e) {
        e;
      }
    }
  
    for (comment of comments) {
      try {
        await comment.save();
      } catch (e) {
        e;
      }
    }
    return users;
}

module.exports = seedTests;
