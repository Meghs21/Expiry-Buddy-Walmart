const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google login route
router.get('/google/login', (req, res, next) => {
// Only allow customer role for Google login
  const role = 'customer';
  const state = JSON.stringify({ role });
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state
  })(req, res, next);
});

// Google signup route (same as login but with different UX flow)
router.get('/google/signup', (req, res, next) => {
// Only allow customer role for Google signup
  const role = 'customer';
  const state = JSON.stringify({ role });
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state
  })(req, res, next);
});

// Google callback route
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/signup?error=google' 
  }),
  (req, res) => {
// Set session
    req.session.userId = req.user._id;
    req.session.userRole = 'customer'; // Always set as customer
    
// Always redirect to home page
    res.redirect('/home');
  }
);

module.exports = router;