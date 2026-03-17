/***********************************************************/
//Required Modules
/***********************************************************/

// Import Express (framework)
const express = require('express');
// Create a router (mini version of app)
const router = express.Router();
// Import bcrypt (used to hash passwords securely)
const bcrypt = require('bcrypt');

// Import User model 
const User = require('../models/user');

/***********************************************************/
//Sign Up Routes
/***********************************************************/

//Render Sign-up form
router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs');
});

//Create new user
router.post('/sign-up', async (req, res) => {
    try{
        // 1. CHECK IF USER EXISTS
        // Look in database for a user with same username
        const userInDatabase = await User.findOne({ username: req.body.username });

        // If username already exists, stop and show error
        if (userInDatabase) {
            return res.status(400).render('error.ejs', {
                error: 'Username already taken.',
            });
        }

        // 2. CHECK PASSWORD MATCH
        // Compare password and confirmPassword from form
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).render('error.ejs', {
                error: 'Password and confirm password must match.',
            });
        }

        // 3. HASH PASSWORD
        // Convert plain password to secure hashed password
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        // Replace plain password with hashed version
        req.body.password = hashedPassword;
        // Remove confirmPassword (don't store it)
        delete req.body.confirmPassword;

        // 4. CREATE USER IN DATABASE
        // Save new user in MongoDB
        const user = await User.create(req.body);

        // 5. LOG USER IN (SESSION)
        // Store user info in session (means user is logged in)
        req.session.user = {
            username: user.username,
            _id: user._id,
        };

        // 6. REDIRECT USER
        // Send user to projects page after signing up
        res.redirect('/projects');
    } catch (error) {
        // 7. ERROR HANDLING
        // Log real error in terminal
        console.log(error); 
        // Show error message to user
        res.status(500).render('error.ejs', {
            error: 'There was a problem creating your account.',
        });
    }
});

/***********************************************************/
//Sign In Routes
/***********************************************************/

//Render sign-in form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

//Sign in existing user
router.post('/sign-in', async (req, res) => {
  try {
    // 1. FIND USER
    // Look for user in database
    const userInDatabase = await User.findOne({ username: req.body.username });

    // If user not found, show error
    if (!userInDatabase) {
      return res.status(400).render('error.ejs', {
        error: 'Login failed. Please try again.',
      });
    }

     // 2. CHECK PASSWORD
     // Compare entered password with hashed password in DB
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );

     // If password is wrong, show error
    if (!validPassword) {
      return res.status(400).render('error.ejs', {
        error: 'Login failed. Please try again.',
      });
    }

    // 3. CREATE SESSION (LOG USER IN)
    // Save user info in session
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    // 4. REDIRECT USER
    // Send user to projects page after login
    res.redirect('/projects');
  } catch (error) {
    // 5. ERROR HANDLING
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem signing you in.',
    });
  }
  });

/***********************************************************/
//Sign Out Route
/***********************************************************/

//Log out user
router.get('/sign-out', (req, res) => {
  // Destroy session (removes user login)
  req.session.destroy(() => {
    // Redirect to homepage after logout
    res.redirect('/');
  });
});

// Makes this file usable in server.js
module.exports = router;