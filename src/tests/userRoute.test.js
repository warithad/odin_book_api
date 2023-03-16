require('dotenv').config();
const app = require('./app')
const request = require('supertest')
const intializeMongoMemoryServer = require('../config/mongoConfigTest');
const seedTests = require('./seedsTest');
const mongoose = require('mongoose')

let userId;

beforeAll(async () => {
    await intializeMongoMemoryServer();
    const obj = await seedTests();
    userId = obj[0].id;
})

test('Should get all users successfully', async () => {
    const res = await request(app)
                .get('/users')
                .set('Accept', 'application/json')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('users')
    expect(res.body.users).toHaveLength(10)
})

test('Should fail to return user with nonexistent id', async () => {
    const res = await request(app)
                .get('/users/5d6ede6a0ba62570afcedd3a')
                .set('Accept', 'application/json')
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('User Not Found')
})

test('Should get specific user with id successfully', async () => {
    const res = await request(app)
                .get(`/users/${userId}`)
                .set('Accept', 'application/json')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user).not.toHaveProperty('friend_requests')
})

test('Should sends friend request successfully', async () => {

})

test('Should friend request successfully', async () => {

})

test('')

afterAll(async() => {
    await mongoose.connection.close();
})