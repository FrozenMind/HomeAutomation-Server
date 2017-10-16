let os = require('os')
let net = require('net')
let fs = require('fs')
let ClientManager = require('./lib/clientManager')
let log = require('./lib/logLevel') //bunyan logger

//init arrays
let esps = new ClientManager(),
  users = new ClientManager(),
  osActiveScks = new ClientManager()

//TCP Server erzeugen!
server = net.createServer(function(sck) {
  log.info("Client connected to TCP Server");
  //on data received
  sck.on('data', function(data) {
    //scope variables
    let eSocket, cSocket,
      jsonData
    try {
      //data = data.toString().replace(/\'/g, '"')
      log.debug(data.toString())
      jsonData = JSON.parse(data)
      log.debug(jsonData)
    } catch (e) {
      log.error("could not parse json")
      return
    }
    //handle received command
    switch (jsonData.cmd) {
      case 0: //add new esp
        log.info("new esp " + jsonData.name + " added to array")
        esps.add(jsonData.name, sck)
        break
      case 1: //app wants to control an esp
        esps.send(jsonData.esp.id, {
          cmd: 101,
          mode: jsonData.mode.id
        })
        break
      case 10: //add android device to array
        log.info("new client " + jsonData.name + " added to array")
        users.add(jsonData.name, sck)
        break
      case 11: //activate os data interval
        osActiveScks.push(users.getObject(jsonData.id).socket) //add interval
        break
      case 12: //remove os data interval
        let index = osActiveScks.indexOf(users.getObject(jsonData.id).socket) //add interval
        osActiveScks.splice(index, 1)
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
