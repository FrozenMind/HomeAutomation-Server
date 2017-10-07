var os = require('os')
var net = require('net')
var bunyan = require('bunyan')
var fs = require('fs')

//Logger init
var log = bunyan.createLogger({
  name: 'ESPServerLogger',
  streams: [{
    level: 'debug',
    stream: process.stdout
  }, {
    level: 'info',
    stream: process.stdout
  }, {
    level: 'error',
    path: __dirname + '/log/error.log'
  }]
});

//TCP Server erzeugen!
server = net.createServer(function(sck) {
  log.info("Client connected to TCP Server");
  //on data received
  sck.on('data', function(data) {
    log.debug(data)
  })

  //on socket disconnect
  sck.on("end", function() {
    log.info("Client disconnected from TCP Server");
  })
  //on socket error (i.e. socket disconnect without closing)
  sck.on('error', function(err) {
    log.error(err);
  })
}).listen(59003, function() {
  log.info("TCP Server listening on Port 59003");
})

//TCP Server Error
server.on("error", function(err) {
  log.error(err);
})
