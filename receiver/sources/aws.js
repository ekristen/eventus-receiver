var hash = require('object-hash')
var restify = require('restify')

module.exports = function awsEvent (req, res, next) {
  if (!req.is('application/json')) {
    return next(new restify.errors.WrongAcceptError('must send json only'))
  }

  // TODO: verify AWS signature?

  req.event = {
    '_hash': hash(req.body, {algorithm: 'sha256', 'encoding': 'hex'}),
    '_source': 'aws',
    '_payload': req.body,
    '_version': 1
  }

  return next()
}
