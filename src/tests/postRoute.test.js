require('dotenv').config();
const app = require('./app')
const request = require('supertest')
const intializeMongoMemoryServer = require('../config/mongoConfigTest');
const seedTests = require('./seedsTest');
const mongoose = require('mongoose')

beforeAll = (async () => {
    
})

afterAll =(async() => {
    await mongoose.connection.close();
})