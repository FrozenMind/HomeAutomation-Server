class OsData {
  constructor() {
    this.sockets = []
    this.interval
    this.os = require('os')
  }

  //add socket
  add(socket) {
    this.sockets.push(socket)
  }

  //remove socket
  remove(socket) {
    this.sockets.splice(this.sockets.indexOf(socket), 1)
  }

  //start interval
  start() {
    let that = this
    this.interval = setInterval(function() {
      if (that.sockets.length > 0) {
        let currentData = that.getOsData()
        for (let o = that.sockets.length - 1; o >= 0; o--) {
          try {
            that.sockets[o].write(JSON.stringify(currentData) + "\n")
          } catch (e) {
            //if socket is not reachable, it is disconnected, so remove it
            that.sockets.splice(o, 1)
          }
        }
      }
    }, 1000)
  }

  //stop interval
  stop() {
    clearInterval(this.interval)
  }

  //get the os data
  getOsData() {
    let data = {}
    data.cores = this.os.cpus().length
    //memory
    data.mem = {}
    data.mem.free = Math.floor(this.os.freemem() / 1000000) //mega bytes
    data.mem.total = Math.floor(this.os.totalmem() / 1000000) //mega bytes
    data.mem.percentage = (this.os.freemem() / this.os.totalmem()).toFixed(2) //%
    //network ip addresses
    data.network = {}
    let netInf = this.os.networkInterfaces()
    for (let i in netInf) {
      if (i != "lo")
        data.network[i] = netInf[i][0].address
    }
    data.uptime = this.os.uptime() //second
    data.cmd = 13
    return data
  }
}

module.exports = OsData
