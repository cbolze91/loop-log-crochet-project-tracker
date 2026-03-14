const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs');
});

router.post('/sign-up', async (req, res) => {
    try{
        const userInDatabase = await User.findOne({ username: req.body.username });

        if (userInDatabase) {
            return res.status(400).render('error.ejs', {
                error: 'Username already taken.',
            });
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).render('error.ejs', {
                error: 'Password and confirm password must match.',
            });
        }

        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        req.body.password = hashedPassword;
        delete req.body.confirmPassword;

        const user = await User.create(req.body);

        req.session.user = {
            username: user.username,
            _id: user._id,
        };

        res.redirect('/projects');
    } catch (error) {
        console.log(error);
        res.status(500).render('error.ejs', {
            error: 'There was a problem creating your account.',
        });
    }
});

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (!userInDatabase) {
      return res.status(400).render('error.ejs', {
        error: 'Login failed. Please try again.',
      });
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );

    if (!validPassword) {
      return res.status(400).render('error.ejs', {
        error: 'Login failed. Please try again.',
      });
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    res.redirect('/projects');
  } catch (error) {
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem signing you in.',
    });
  }
  });

router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;