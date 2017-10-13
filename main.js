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
})

var esps = [],
  clients = [],
  osActiveScks = []

//TCP Server erzeugen!
server = net.createServer(function(sck) {
  log.info("Client connected to TCP Server");
  //on data received
  sck.on('data', function(data) {
    //scope variables
    let eSocket, cSocket,
      jsonData
    sck.write("echo \n")
    try {
      data = data.toString().replace(/\'/g, '"')
      log.debug(data)
      jsonData = JSON.parse(data)
      log.debug(data)
    } catch (e) {
      log.error("could not parse json")
    }

    switch (jsonData.cmd) {
      case 0: //add new esp
        if (!getESPSocket(jsonData.id)) { //check if id exists
          sck.write(getSocketError(1) + "\n") //ID exists already in arr
          return
        }
        log.info("new esp " + jsonData.name + " added to array")
        sck.id = jsonData.id
        esps.push(sck)
        break
      case 1: //app wants to control an esp
        eSocket = getESPSocket(jsonData.esp.id)
        if (eSocket) //if socket exist in array
          eSocket.write("" + jsonData.mode.id + "\n")
        else
          sck.write(getSocketError(0) + "\n")
        break
      case 10: //add android device to array
        if (!getESPSocket(jsonData.id)) { //check if id exists
          sck.write(getSocketError(1) + "\n") //id exists already
          return
        }
        log.info("new client " + jsonData.name + " added to array")
        sck.id = jsonData.id
        clients.push(sck)
        break
      case 11: //activate os data interval
        cSocket = getClientSocket(jsonData.id)
        if (cSocket)
          osActiveScks.push(cSocket) //add interval
        else
          sck.write(getSocketError(0) + "\n")
        break
      case 12: //remove os data interval
        cSocket = getClientSocket(jsonData.id)
        if (cSocket)
          removeFromArray(osActiveScks, cSocket) //remove interval
        else
          sck.write(getSocketError(0) + "\n") //TODO: send error code to socket, id does not exist
        break
    }
  })

  //on socket disconnect
  sck.on("end", function() {
    log.info("Client disconnected from TCP Server")
  })
  //on socket error (i.e. socket disconnect without closing)
  sck.on('error', function(err) {
    log.error(err);
  })
}).listen(59003, function() {
  log.info("TCP Server listening on Port 59003")
})

//TCP Server Error
server.on("error", function(err) {
  log.error(err)
})

//returns object with os statistics
let osInterval = setInterval(osDataIntervalFct, 1000)

function getOsData() {
  let osData = {}
  osData.cores = os.cpus().length
  //memory
  osData.mem = {}
  osData.mem.free = Math.floor(os.freemem() / 1000000) //mega bytes
  osData.mem.total = Math.floor(os.totalmem() / 1000000) //mega bytes
  osData.mem.percentage = (os.freemem() / os.totalmem()).toFixed(2) //%
  //network ip addresses
  osData.network = {}
  let netInf = os.networkInterfaces()
  for (let i in netInfnetworkInterfaces) {
    if (i != "lo")
      osData.network[i] = netInf[i][0].address
  }
  osData.uptime = os.uptime() //second
  osData.cmd = 12
  return osData
}

function osDataIntervalFct() {
  let osData
  if (osActiveScks.length > 0) {
    osData = getOsData()
    for (let o = 0; o < osActiveScks.length; o++) {
      osActiveScks[o].write(osData + "\n")
    }
  }
}

function getESPSocket(id) {
  esps[esps.findIndex((e) => {
    return e.id == id
  })]
}

function getClientSocket(id) {
  clients[clients.findIndex((c) => {
    return c.id == id
  })]
}

function removeFromArray(arr, element) {
  if (index !== -1) {
    let index = arr.indexOf(element);
    arr.splice(index, 1);
  }
}

//handles socket error
function getSocketError(id) {
  var errO = {
    err: id
  }

  switch (id) {
    case 0:
      errO.msg = "Device not registered"
      break
    case 1:
      errO.msg = "Device already registered"
      break
    default:
      errO.msg = ""
      break
  }
  return JSON.stringify(errO)
}
