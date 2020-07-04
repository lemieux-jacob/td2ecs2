const express = require('express')
const router = express.Router();
const User = require('../models/user')
const Character = require('../models/character')

router.use(require('../modules/token').auth)

// Get All
router.get('/', async (req, res) => {
  try {
    const characters = await Character.find({
      owner: req.user._id
    })
    res.json(characters)
  } catch (err) {
    res.sendStatus('500').json({
      message: err.message
    })
  }
})

// Get One
router.get('/:id', getCharacter, async (req, res) => {
  res.json(res.character)
})

// Create
router.post('/', async (req, res) => {
  console.log(req.user._id)
  const character = new Character({
    'owner': req.user._id,
    'name': req.body.name,
    'heritage': req.body.heritage,
    'traits': req.body.traits,
    'proficiency': req.body.proficiency,
    'mastery': req.body.mastery
  })

  try {
    const newCharacter = await character.save()
    res.status('201').json(newCharacter)
  } catch (err) {
    res.status('400').json({
      message: err.message
    })
  }
})

// Update
router.patch('/:id', getCharacter, async (req, res) => {
  let props = [
    'name',
    'heritage',
    'traits',
    'proficiency',
    'mastery'
  ]
  props.forEach(prop => {
    if (req.body[prop] != null) {
      res.character.name = req.body[prop]
    }
  })
  try {
    const updatedCharacter = await res.character.save()
    res.json(updatedCharacter)
  } catch (err) {
    res.status('400').json({
      message: err.message
    })
  }
})

// Delete
router.delete('/:id', getCharacter, async (req, res) => {
  try {
    await res.character.remove()
    res.json({
      message: 'Deleted Character'
    })
  } catch (err) {
    res.status('500').json({
      message: err.message
    })
  }
})

// Middleware
async function getCharacter(req, res, next) {
  let character
  try {
    character = await Character.findById(req.params.id)
    // Ensure Character Exists in DB
    if (character == null) {
      return res.status('404').json({
        message: 'Cannot find Character'
      })
    }
    // Verify the Authenticated User owns Character
    if (req.user._id != character.owner) {
      return res.status('404').json({
        message: 'Action is Unauthorized'
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
  res.character = character
  next()
}

module.exports = router