var config = require('rc')('eventus', {
  receiver: {
    port: 4000,
    secret: 'abc123',
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
      secret: null
    },
    prometheus: {

    },
    docker: {
    
    },
    splunk: {
    
    }
  }
}).receiver

module.exports = config
