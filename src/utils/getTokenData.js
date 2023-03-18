const jwt = require('jsonwebtoken')
const ExtractJwt = require('passport-jwt').ExtractJwt

const JWT_SECRET = process.env.JWT_SECRET

const getTokenData = (req, res, next) => {
    if(!req.user){
        const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
        const payload = jwt.verify(jwtFromRequest(req), JWT_SECRET)
        req.payload = payload
    }
    else {
        req.payload = user;
    }
    next();
}

module.exports = getTokenData