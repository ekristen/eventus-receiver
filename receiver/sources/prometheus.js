var hash = require('object-hash')
var restify = require('restify')

module.exports = function PrometheusEvent (req, res, next) {
  if (!req.is('application/json')) {
    return next(new restify.errors.WrongAcceptError('must send json only'))
  }

  req.event = {
    '_hash': hash(req.body, {algorithm: 'sha256', 'encoding': 'hex'}),
    '_source': 'prometheus',
    '_payload': req.body,
    '_version': 1
  }

  return next()
}
