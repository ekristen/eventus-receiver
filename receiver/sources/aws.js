var hash = require('object-hash')
var restify = require('restify')

module.exports = function(req, res, next) {
  if (!req.is('application/json')) {
    return next(new restify.errors.WrongAcceptError('must send json only'))
  }

  req.event = {
    '_hash': hash(req.body, {algorithm: 'sha256', 'encoding': 'hex'}),
    '_source': 'aws',
    '_payload': req.body
  }
  
  return next()
}
