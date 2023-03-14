
const express = require('express')
const app = express();
const { signup } = require('../utils/auth') 


app.use(express.json());
// app.use(express.urlencoded());

app.post('/signup', signup);

module.exports = app;