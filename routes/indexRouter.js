const express = require('express')
const router = express.Router()
const token = require('../modules/token')

router.get('/', (req, res) => {
  res.render('app', {
    'title': 'App'
  })
})

module.exports = router