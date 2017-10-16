class ClientManager {
  constructor() {
    this.clients = []
    this.idCounter = 0
  }

  //add id to client array
  add(name, socket) {
    this.clients.add[{
      socket: socket,
      id: this.idCounter,
      name: name
    }]
    //tell client his new id
    send(this.idCounter, {
      cmd: 100,
      id: this.idCounter
    })
    this.idCounter++;
  }

  //remove id from client array
  remove(id) {
    if (id !== -1) {
      let index = getIndex(id)
      this.clients.splice(index, 1)
    }
  }

  //send msg to client
  send(id, objMsg) {
    getObject(id).socket.write(JSON.stringify(objMsg))
  }

  //send error to client
  error(id, errCode) {
    let err = {}
    switch (errCode) {
      case 0:
        err.msg = "id does not exist"
        break
      case 1:
        err.msg = "id exist already"
        break
      default:
        err.msg = "an unknown error occured"
    }
    err.errCode = errCode
    getObject(id).socket.write(JSON.stringify(err))
  }

  //find id in client
  getObject(id) {
    let index = this.clients.findIndex((c) => {
      return c.id == id
    })
    return index == -1 ? -1 : this.clients[index]
  }

  //find index of id
  getIndex(id) {
    let index = this.clients.findIndex((c) => {
      return c.id == id
    })
    return index
  }
}

//export class
module.exports = ClientManager
