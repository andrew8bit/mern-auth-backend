// imports
require('dotenv').config();
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env

const db = require('../models');

const test = (req, res) => {
    res.json({ message: 'User endpoint OK! ✅'})
}

const register = (req, res) => {
    // POST - adding the new user to the database
    console.log('==================> Inside of /register ');
    console.log('========> req.body')
    console.log(req.body)

    const { name, email, password } = req.body

    db.User.findOne({ email: email })
    .then(user => {
        // if email already exists, a user will come back 
        if (user) {
            return res.status(400).json({ message: 'Email already exists' })
        } else {
            const newUser = new db.User ({
                name: name,
                email: email,
                password: password
            })
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw Error;

                bcrypt.hash(newUser.password, salt, (err, hashedPassword) => {
                    if (err) console.log('====> Error inside of hash', err)
                    // Change the password in newUser to the hash
                    newUser.password = hashedPassword; 
                    newUser.save()
                    // .then(createdUser => res.json(createdUser))
                    .then(createdUser =>  {
                        res.json(createdUser) 
                    })
                    .catch(err => console.log(err))
                })
            })
        }
    })
    .catch(err => console.log('Error finding user', err))
}

const login = async(req, res) => {
    // POST - finding a user and return the user
    console.log('==================> Inside of /login');
    console.log('========> req.body')
    console.log(req.body)

    const { name, password, email } = req.body

    const foundUser = await db.User.findOne({ email })
    if(foundUser) { // <------------------------------------------- we found a user
        // user is in the database 
        let isMatch = await bcrypt.compare( password, foundUser.password );
        console.log(isMatch);
        if (isMatch) { // <------------------------------------------- passwords matched
            // if user match, then we want to send JSON Web Token 
            // Create a token payload 
            // add an expiredToken variable = Date.now()
            // save the user 

            const payload = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name
            }

            jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {

                if (err) {
                    res.status(400).json({ message: 'Session has ended, please log in again'})
                }

                const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60})
                console.log(legit);
                res.json( { success: true, token: `Bearer ${token}`, userData: legit })
            });

        } else { // <------------------------------------------- passwords did not match
            return res.status(400).json( { message: 'Email or Password were incorrect'})
        }
    } else { // <------------------------------------------- user not found 
        return res.status(400).json( { message: 'User not found'})
    }
}




module.exports = {
    test,
    register,
    login,
}