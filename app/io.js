const app = require('./app')
const http = require('http')
const socketio = require('socket.io')

// Create WebServer
const server = http.createServer(app)
const io = socketio(server)

module.exports = server
