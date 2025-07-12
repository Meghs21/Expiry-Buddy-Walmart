const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Customer = require('../models/Customer');
const Retailer = require('../models/Retailer');
const bcrypt = require('bcryptjs');

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, { id: user.id, role: user.role });
});

// Deserialize user from the session
passport.deserializeUser(async (data, done) => {
  try {
    let user;
    if (data.role === 'customer') {
      user = await Customer.findById(data.id);
    } else if (data.role === 'retailer') {
      user = await Retailer.findById(data.id);
    }
    
    if (user) {
      user.role = data.role; // Add role to the user object
      done(null, user);
    } else {
      done(new Error('User not found'));
    }
  } catch (err) {
    done(err);
  }
});

// Google OAuth strategy - Only for customers
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: '/auth/google/callback'
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     // Only allow customer role for Google authentication
//     const role = 'customer';
    
//     // Check if customer already exists
//     let customer = await Customer.findOne({ email: profile.emails[0].value });
    
//     if (!customer) {
//       // Generate a random password
//       const randomPassword = Math.random().toString(36).slice(-8);
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
//       // Create new customer
//       customer = new Customer({
//         fullName: profile.displayName,
//         email: profile.emails[0].value,
//         password: hashedPassword,
//         googleId: profile.id
//       });
//       await customer.save();
//     } else if (!customer.googleId) {
//       // If customer exists but doesn't have googleId, update it
//       customer.googleId = profile.id;
//       await customer.save();
//     }
    
//     customer.role = 'customer';
//     return done(null, customer);
//   } catch (err) {
//     return done(err);
//   }
// }));

module.exports = passport;
