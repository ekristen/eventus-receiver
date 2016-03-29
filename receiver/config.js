var config = module.exports = require('rc')('eventusreceiver', {
  port: 4000,
  logger: {
    level: 'debug'
  },
  nsq: {
    nsqd: ['localhost:4150'],
    topic: 'eventus-receiver'
  },
  db: {
    path: './data'
  },
  github: {
    secret: 'abc123'
  },
  prometheus: {

  },
  docker: {
    
  },
  splunk: {
    
  }
})
