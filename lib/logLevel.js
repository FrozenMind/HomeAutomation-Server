//create log levels
let logLevel = require('bunyan').createLogger({
  name: 'MainLogger',
  streams: [{
    level: 'debug',
    stream: process.stdout
  }, {
    level: 'info',
    stream: process.stdout
  }, {
    level: 'error',
    path: __dirname + '/../log/error.log'
  }]
})

module.exports = logLevel
