const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
})

userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) return next()

  try {
    const hash = await bcrypt.hash(user.password, 10)
    user.password = hash
  } catch (err) {
    return next(err)
  }

  return next()
})

module.exports = mongoose.model('User', userSchema)