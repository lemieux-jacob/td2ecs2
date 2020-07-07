const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const token = require('../modules/token')

/** 
 * User Status
 */
router.get('/status', token.status, async (req, res) => {
  return res.json(
    req.user || {
      'status': 'logged out'
    })
})

/**
 * Register User
 */
router.post('/register', async (req, res) => {
  const user = new User({
    'email': req.body.email,
    'password': req.body.password,
  })

  try {
    const newUser = await user.save()
    res.status('201').json({
      'email': newUser.email
    })
  } catch (err) {
    res.status('400').json({
      message: err.message
    })
  }
})

/**
 * Login User
 */

router.post('/login', async (req, res) => {
  let user, result

  // Get User from DB
  try {
    user = await User.findOne({
      email: req.body.email
    })
  } catch (err) {
    return res.status('500').json({
      message: err.message
    })
  }

  if (user == null) {
    return res.status('404').json({
      message: 'Cannot find User'
    })
  }

  // Compare Passwords
  try {
    result = await bcrypt.compare(req.body.password, user.password)
  } catch (err) {
    return res.status('500').json({
      message: err.message,
      password: req.body.password,
      hash: user.password
    })
  }

  if (result !== true) {
    return res.status('401').json({
      message: 'User Credentials did not match our records'
    })
  }

  // Generate Access Token
  const accessToken = token.generate({
    id: user._id,
    email: user.email,
    createdAt: user.createdAt
  }, process.env.ACCESS_TOKEN_SECRET)

  // Generate Refresh Token
  const refreshToken = token.generate({
    id: user._id,
    email: user.email,
    createdAt: user.createdAt
  }, process.env.REFRESH_TOKEN_SECRET)

  // Set Access Token Cookie
  res.cookie('token', accessToken, {
    httpOnly: true
  })

  // Set Refresh Token Cookie
  res.cookie('refresh', refreshToken, {
    httpOnly: true
  })

  // Send User Data sans Password
  res.json({
    'user': {
      '_id': user._id,
      'email': user.email,
      'createdAt': user.createdAt
    }
  });
})

/**
 * Logout User
 */
router.get('/logout', (req, res) => {
  res.clearCookie('refresh')
  res.clearCookie('token')
  res.status('200').json({
    message: 'Logged Out'
  })
})

module.exports = router