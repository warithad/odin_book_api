require('dotenv').config()
const app = require('./app')
const request = require('supertest')
const intializeMongoMemoryServer = require('../config/mongoConfigTest');
const seedTests = require('./seedsTest');
const mongoose = require('mongoose');
const User = require('../models/user');

let user;
let token;
let secondUser;
let secondToken;

beforeAll(async () => {
    await intializeMongoMemoryServer();
    const obj = await seedTests();   
})

test('test sign up works', async () => {
    const res  = await request(app)
        .post('/signup')
        .send({
            first_name: 'John',
            last_name: 'Doe',
            email: 'johndoe@gmail.com',
            password: 'testingpassword'
        })
        .set('Accept', 'application/json')
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('token')
        expect(res.body).toHaveProperty('user')
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('Sign up successful')
        
        token = res.body.token.token
        user = res.body.user;

})

//Sign up with the second user and send a friend request to the second user with first user then accept
test('second user sign up', async () => {
    const res  = await request(app)
        .post('/signup')
        .send({
            first_name: 'Ben',
            last_name: 'Dover',
            email: 'bendove@example.com',
            password: 'testingpassword'
        })
        .set('Accept', 'application/json')
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('token')
        expect(res.body).toHaveProperty('user')
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('Sign up successful')
        
        secondToken = res.body.token.token
        secondUser = res.body.user
    })

test('Should get all users successfully', async () => {
    const res = await request(app)
                .get('/users')
                .set('Authorization', token)
                .set('Accept', 'application/json')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('users')
    expect(res.body.users).toHaveLength(12)
})

test('Should fail to return user with nonexistent id', async () => {
    const res = await request(app)
                .get('/users/5d6ede6a0ba62570afcedd3a')
                .set('Accept', 'application/json')
                .set('Authorization', token)
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('User Not Found')
})

test('Should get specific user with id successfully', async () => {
    const res = await request(app)
                .get(`/users/${user.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user).not.toHaveProperty('friend_requests')
})

test('Should not send friend request successfully', async () => {
    const res = await request(app)
            .post(`/users/friends/`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send({id: user.id})
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('You cannot send a friend request to yourself')
 
})

test('Should send friend request successfully', async () => {
    const res = await request(app)
            .post(`/users/friends/`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send({id: secondUser.id})
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user).not.toHaveProperty('friend_requests')

})

test.skip('Should add friend successfully', async () => {
    const res = await request(app)
            .put('/users/friends/')
            .set('Authorization', secondToken)
            .send({id: user.id})
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user).toHaveProperty('friends')
    expect(res.body.user.friends).toHaveLength(1)
    expect(res.body.user).toHaveProperty('friend_requests')
    expect(res.body.user.friend_requests).toHaveLength(0)
})

test('Should reject friend request successfully', async () => {
    const res = await request(app)
                .delete(`/users/friends/${user.id}`)
                .set('Authorization', secondToken)
                .set('Accept', 'application/json')
    expect(res.statusCode).toBe(200)
    expect(res.body.user.friend_requests).toHaveLength(0)
    expect(res.body.user.friends).toHaveLength(0)
})

test('Should delete user account successfully', async () => {
    const res = await request(app)
                .delete('/users/')
                .set('Authorization', token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe('User deleted successfully')
})

afterAll(async() => {
    //Close connection after tests run
    await mongoose.connection.close();
})