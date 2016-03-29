var config = require('./config')

var pkg = require('../package.json')
var restify = require('restify')
var bunyan = require('bunyan')
var level = require('level-hyper')
var nsq = require('nsq.js')
var mts = require('monotonic-timestamp')
var key = require('level-key')
var crypto = require('crypto')
var LiveStream = require('level-live-stream')
var hash = require('object-hash')

var datastore = level(config.db.path, {
  valueEncoding: 'json'
})
LiveStream.install(datastore)

var writer = nsq.writer(config.nsq)

var liveStream = datastore.createLiveStream({
  gte: '!event!',
  lte: '!event!~',
  old: true,
  tail: true
})
  .on('data', function(data) {
    var self = this

    if (data.type !== 'put') {
      return
    }

    logger.debug({data: data}, 'readStream data')

    writer.publish(config.nsq.topic, data.value, function(err) {
      if (err) {
        return self.emit('error', err)
      }
      
      datastore.del(data.key, function(err) {
        if (err) {
          return self.emit('error', err)
        }
      })
    })
  })
  .on('error', function(err) {
    logger.error({err: err}, 'readstream error')
  })
  .pause()

writer
  .on('ready', function() {
    logger.info('nsq connection ready, unpausing read stream')
    liveStream.resume()
  })
  .on('close', function() {
    logger.warn('nsq connection closed, pausing read stream')
    liveStream.pause()
  })
  .on('error', function(err) {
    logger.fatal({err: err}, 'unable to connect to nsqd')
    liveStream.pause()
  })
  .connect()

function saveEvent(req, res, next) {
  logger.debug({event: req.event}, 'saveEvent')

  req.event['_time'] = mts()

  datastore.put(key('event', req.event._time), req.event, function(err) {
    if (err) {
      logger.fatal({err: err}, 'level error')
      return next(err)
    }
    
    logger.debug('saveEvent: sucess')
    res.send({success: true})
    return next()
  })
}

var logger = bunyan.createLogger({
  name: pkg.name,
  level: config.logger.level
})

var server = restify.createServer({
  name: pkg.name,
  version: '1.0.0'
})

server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser())
server.use(restify.bodyParser({ mapParams: false }))

server.on('after', restify.auditLogger({
  log: logger.child({type: 'audit'})
}))

server.pre(function(req, res, next) {
  // Beat AWS into submission
  if (req.url == '/e/aws') {
    req.headers['accept'] = 'application/json'
    req.headers['content-type'] = 'application/json'
  }
  return next()
})

server.post('/e/splunk', require('./sources/splunk'), saveEvent)

server.post('/e/github', require('./sources/github'), saveEvent)

server.post('/e/aws', require('./sources/aws'), saveEvent)

server.post('/e/docker', require('./sources/docker'), saveEvent)

server.get('/', function(req, res, next) {
  res.send({
    name: server.name,
    version: server.versions,
    msg: 'the force is strong with this one'
  })
  return next()
})

server.listen(config.port, function () {
  logger.info('%s listening at %s', server.name, server.url);
})
