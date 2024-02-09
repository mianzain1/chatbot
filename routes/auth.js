// routes/auth.js

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        res.redirect('/login'); // Redirect to login page after successful signup
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Error signing up');
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard', // Redirect to the dashboard on successful login
    failureRedirect: '/login',    // Redirect back to the login page on failure
    failureFlash: true,           // Enable flash messages for failed login attempts
}));

// ... (other code)

// ... other authentication routes

module.exports = router;
