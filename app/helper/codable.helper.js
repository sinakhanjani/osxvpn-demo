const fs = require('fs')
const path = require('path')

const decode = function (filename, path, callback) {
    try {
        // ('sendCode.html', 'html', callback)
        const route = __dirname + `/${path}/` + `${filename}`
        const dataBuffer = fs.readFileSync(route)
        const dataJSON = dataBuffer.toString()
        const data = JSON.parse(dataJSON)
        callback(data)
    } catch (e) {
        console.log(e)
    }
}

const encode = function (data, filename, path) {
    try {
        // ('sendCode.html', 'html', callback)
        const route = __dirname + `/${path}/` + `${filename}`
        console.log('route', route);
        const dataJSON = JSON.stringify(data)
        fs.writeFileSync(route, dataJSON, "utf8")
    } catch (e) {
        console.log('problem',e)
    }
}

module.exports = {
    decode,
    encode
}