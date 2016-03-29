var config = require('../config.js')

var crypto = require('crypto')
var hash = require('object-hash')
var restify = require('restify')

module.exports = function(req, res, next) {
  if (!req.is('application/json')) {
    return next(new restify.errors.WrongAcceptError('must send json only'))
  }
  
  if (typeof req.headers['x-hub-signature'] == 'undefined') {
    return next(new restify.errors.InvalidHeaderError('missing x-hub-signature, is this a valid github webhook'))
  }
  
  var signature = req.headers['x-hub-signature']
  var hash_type = signature.split('=')[0]
  var hash = signature.split('=')[1]
  var event = req.headers['x-github-event']

  try {
    var verifyhash = crypto.createHmac(hash_type, config.github.secret).update(req._body).digest('hex')
  } catch(e) {
    return next(e)
  }

  if (hash !== verifyhash) {
    return next(new restify.errors.BadDigestError('x-hub-signature does not match'))
  }
  
  req.event = {
    '_hash': hash(req.body, {algorithm: 'sha256', 'encoding': 'hex'}),
    '_source': 'github',
    '_payload': req.body
  }
  
  return next()
}
