const { ExtractJwt, Strategy } = require('passport-jwt')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

let BLANK_JWT

function findUser(payload, done) {
  const User = mongoose.model('User')
  const Admin = mongoose.model('Admin')

  if (payload.anonymous) {
    return done(null, new User())
  }


  User.findOne({ _id: payload.id })
    .then(user => {
      if(user) done(null, user)
      else{
        Admin.findOne({ _id: payload.id })
          .then(admin => admin ? done(null, admin): done(null, false))
          .catch(error => done(error, false))
      }
    })
    .catch(error => done(error, false))
}

function configurePassport(passport, options) {

  const params = Object.assign({}, options)

  BLANK_JWT = BLANK_JWT || generateJwt(options.secretOrKey, { issuer: options.issuer, audience: options.audience })
  params.jwtFromRequest = req => req.headers.authorization || BLANK_JWT
  passport.use(new Strategy(params, findUser))
}

function generateJwt(secret, options) {
  return jwt.sign(
    { anonymous: true },
    secret,
    Object.assign({
      expiresIn: '30d',
    }, options)
  )
}

module.exports = {
  generateJwt,
  configurePassport
}
