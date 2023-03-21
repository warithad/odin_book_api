const passport = require('passport')
const express = require('express')
const app = express();
const { signup, signin } = require('../utils/auth') 
const jwtStrategy = require('../utils/strategy')

passport.use(jwtStrategy);

app.use(express.json());
// app.use(express.urlencoded());
const userRouter = require('../routes/userRoute')
const postRouter = require('../routes/postRouter')

app.use('/posts', postRouter)
app.use('/users', userRouter)
app.post('/signup', signup);
app.post('/signin', signin);


module.exports = app;