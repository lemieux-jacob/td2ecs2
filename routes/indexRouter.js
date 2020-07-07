const express = require('express')
const router = express.Router()
const token = require('../modules/token')
const fs = require('fs')

router.get('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync('dist/json/app.json'))
  res.render('app', {
    'title': 'App',
    'heritages': data.heritages,
    'proficiencies': data.proficiencies
  })
})

module.exports = router