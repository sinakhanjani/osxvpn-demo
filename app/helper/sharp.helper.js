const sharp = require('sharp')
require('dotenv').config()
const config = require('config')
const env = config.get('env')

const compressJPG = (file,bounds) => {
    const filename = file.filename
    const path = file.path 
    const [name, ext] = filename.split('.')
    
    sharp(`./${path}`)
    .jpeg({ compressionLevel: 1, adaptiveFiltering: true, force: true })
    .resize(bounds)
    .withMetadata()
    .toFile(`${env.FILE_DIRECTORY}/${name}-micro.${ext}`, function(err) {
        if (err) {
            
        }
    })
    
    const dir = env.FILE_DIRECTORY.substr(1)
    
    return `${dir}/${name}-micro.${ext}`
}

module.exports = compressJPG