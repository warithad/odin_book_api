require('dotenv').config();
const app = require('./app')
const request = require('supertest')
const intializeMongoMemoryServer = require('../config/mongoConfigTest')
const mongoose = require('mongoose')

beforeAll(async () => {
    await intializeMongoMemoryServer();
})


test('test sign up works', async () => {
    const res  = await request(app)
        .post('/signup')
        .send({
            first_name: 'John',
            last_name: 'Doe',
            email: 'johndoe@gmail.com',
            password: 'Sktelse'
        })
        .set('Accept', 'application/json')
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('token')
        expect(res.body).toHaveProperty('user')
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('Sign up successful')
})

test('Test sign in works', async () => {
    const res = await request(app)
        .post('/signin')
        .send({
            email: 'johndoe@gmail.com',
            password: 'Sktelse'
        })
        .set('Accept', 'application/json')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('token')
        expect(res.body).toHaveProperty('user')
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('Sign in successful');
        
})


test('Test wrong signin information returns error', async () => {
    const res = await request(app)
        .post('/signin')
        .send({
            email: 'johndoe@gmail.com',
            password: 'whatever'
        })
        .set('Accept', 'application/json')
        expect(res.statusCode).toBe(401);
})

afterAll(async () => {
    //Close mongodb connection after all tests run
    await mongoose.connection.close();
})
