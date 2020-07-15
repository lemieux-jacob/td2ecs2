const mongoose = require('mongoose')
const Schema = mongoose.Schema

const characterSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  heritage: {
    type: String,
    required: true
  },
  traits: {
    type: [{
      type: String
    }],
    required: true,
    validate: [arrayLimit, '{PATH} exceeds the limit of 7']
  },
  proficiency: {
    type: String,
    required: true
  },
  mastery: {
    type: String,
    required: true
  },
  hp: {
    type: Number,
    default: 0,
    required: true
  },
  maxhp: {
    type: Number,
    default: 0,
    required: true
  },
  hpmod: {
    type: Number,
    default: 0,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
})

function arrayLimit(arr) {
  return arr.length <= 7
}

module.exports = mongoose.model('Character', characterSchema)