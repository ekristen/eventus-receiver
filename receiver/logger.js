var config = require('./config')
var pkg = require('../package.json')
var bunyan = require('bunyan')

var logger = bunyan.createLogger({
  name: pkg.name,
  level: config.logger.level,
  serializers: bunyan.stdSerializers
})

module.exports = logger
