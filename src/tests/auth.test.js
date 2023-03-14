require('dotenv').config();
const app = require('./app')
const request = require('supertest')
const intializeMongoMemoryServer = require('../config/mongoConfigTest')

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
        expect(res.body).toHaveProperty('message')
        expect(res.body).toHaveProperty('user')
        expect(res.body.message).toBe('Sign up successful')
})

afterAll(() => {
    console.log('Hello');  
  })
  