var config = require('../config.js')
var logger = require('../logger.js').child({source: 'eventus'})

var objectHash = require('object-hash')
var deepcopy = require('deepcopy')
var crypto = require('crypto')
var restify = require('restify')
var xtend = require('xtend')

module.exports = function EventusEvent (req, res, next) {
  if (!req.is('application/json')) {
    return next(new restify.errors.WrongAcceptError('must send json only'))
  }

  if (typeof req.headers['x-signature'] === 'undefined') {
    return next(new restify.errors.InvalidHeaderError('missing x-signature header'))
  }

  var hash = req.headers['x-signature']

  try {
    var verifyHash = crypto.createHmac('sha256', config.secret).update(req._body).digest('hex')
  } catch (e) {
    req.log.error({err: e}, 'unable to create verifyHash')
    return next(e)
  }

  logger.debug({expected: verifyHash, actual: hash}, 'hashes')

  if (hash !== verifyHash) {
    return next(new restify.errors.BadDigestError('x-signature does not match'))
  }

  if (typeof req.body['_source'] === 'undefined') {
    return next(new restify.errors.MissingParameterError('missing _source parameter in the json body'))
  }
  if (typeof req.body['_time'] === 'undefined') {
    return next(new restify.errors.MissingParameterError('missing _time parameter in the json body'))
  }

  var payload = deepcopy(req.body)

  var event = {}
  event['_hash'] = objectHash(req.body, {algorithm: 'sha256', 'encoding': 'hex'})
  event['_signature'] = req.headers['x-signature']
  event['_source'] = req.body['_source']
  event['_time'] = req.body['_time']
  event['_raw'] = payload
  event['_version'] = 1

  req.event = xtend(payload, event)

  return next()
}
