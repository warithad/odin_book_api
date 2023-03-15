
const express = require('express')
const app = express();
const { signup, signin } = require('../utils/auth') 


app.use(express.json());
// app.use(express.urlencoded());

app.post('/signup', signup);
app.post('/signin', signin);

module.exports = app;