var config = require('../config.js')

var crypto = require('crypto')
var hash = require('object-hash')
var restify = require('restify')

module.exports = function GitHubEvent (req, res, next) {
  if (!req.is('application/json')) {
    return next(new restify.errors.WrongAcceptError('must send json only'))
  }

  if (config.github.secret === null) {
    return next(new restify.errors.PreconditionRequiredError('github secret missing'))
  }

  if (typeof req.headers['x-hub-signature'] === 'undefined') {
    return next(new restify.errors.InvalidHeaderError('missing x-hub-signature, is this a valid github webhook'))
  }

  var signature = req.headers['x-hub-signature']
  var hashType = signature.split('=')[0]
  var hashValue = signature.split('=')[1]

  try {
    var verifyHash = crypto.createHmac(hashType, config.github.secret).update(req._body).digest('hex')
  } catch (e) {
    req.log.error({err: e}, 'unable to create verifyHash')
    return next(e)
  }

  if (hashValue !== verifyHash) {
    req.log.error({actual: hash, expected: verifyHash}, 'signatures do not match')
    return next(new restify.errors.BadDigestError('x-hub-signature does not match'))
  }

  req.event = {
    '_hash': hash(req.body, {algorithm: 'sha256', 'encoding': 'hex'}),
    '_source': 'github',
    '_payload': req.body,
    '_version': 1
  }

  return next()
}
