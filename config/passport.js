const passport = require('passport');

require('dotenv').config();
// A passport strategy for authenticating with a JSON Web Token
// This allows to authenticate endpoints using a token
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// question: how would we refactor the about to lines with destuctoring?

const { Strategy, ExtractJwt} = require('passport-jwt');
const mongoose = require('mongoose');

// Import user model
const { User } = require('../models/user')

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
    // Add code here       
    passport.use(new Strategy(options, (jwt_payload, done) => {
        // Have a user that we're find by the id inside of the payload 
        User.findById(jwt_payload.id)
        .then(user => {
            // jwt payload is an object that contains JTW info
            // done is callback that we will be using to return user of false
            if (user) {
                // if a user is found, return done with null (for error) and user
                return done(null, user);
            } else {
                // no user was found
                return done(null, false);
            }
            // written as a ternary 
            // const userOrNot = user ? done(null, user) : done(null, false)
            // return UserOrNot
        })
        .catch(error => {
            console.group('==============> ERROR (passport.js) <==================')
            console.log(error)
        })
    }))
}