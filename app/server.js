const server = require('./io')
const chalk = require('chalk')
require('dotenv').config()

// Listening server
const listerner = server.listen(() => {
    console.log(`Socket: ${listerner.address().port} is opening on port.`)
})