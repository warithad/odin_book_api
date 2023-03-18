require('dotenv').config()
const passport = require('passport')
const express = require('express')
const cors = require('cors')
const compression = require('compression')
const logger = require('morgan')
const helmet = require('helmet')

const intializeMongoDb = require('./src/config/mongoConfig');
const jwtStrategy = require('./src/utils/strategy')
const app = express();

main().catch(error => console.log(error));
async function main(){
    await intializeMongoDb();
}
passport.use(jwtStrategy);

// app.use(cors)
app.use(compression())
app.use(logger('dev'))
app.use(express.urlencoded({extended: false}))
app.use(helmet())
app.use(passport.initialize());
app.use(passport.session());

const {signin, signup} = require('./src/utils/auth')
const userRouter = require('./src/routes/userRoute')
const postRouter = require('./src/routes/postRouter')

app.use('api/posts', postRouter)
app.use('api/users', userRouter)
app.use('api/signin', signin)
app.use('api/signup', signup)
app.get('/', (req, res) => {
    res.redirect('/api/signin');
})

app.use((req, res, next) =>{
    res.status(404);
    throw new Error('Not Found');
})
module.exports(app);

