const jwt = require('jsonwebtoken')

// Authenticate Access Token
const authorizeToken = function (req, res, next) {
  const token = getToken(req)

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Verify Access Token (For User Status)
const verifyToken = function (req, res, next) {
  const token = getToken(req)

  if (token == null) {
    return next()
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    console.log(user)
    next()
  })
}

// Retrieve Access Token
const getToken = function (req) {
  const raw = req.headers['authorization'] || // Auth Header
    req.query.token || // Get
    req.body.token || // Post
    req.cookies.token // Cookie
  const token = raw && raw.split(' ')[1] || raw
  return token
}

// Generate Access Token
const generateToken = function (user, secret, expires) {
  let options = {}
  if (expires != null) {
    options = {
      expiresIn: expires
    }
  }
  return jwt.sign(user, secret, options)
}

module.exports = {
  'generate': generateToken,
  'auth': authorizeToken,
  'status': verifyToken
}