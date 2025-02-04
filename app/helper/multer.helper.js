const multer = require('multer');
const fs = require('fs');
const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()
const config = require('config')
const env = config.get('env')

const storage = multer.diskStorage({
    limits: {
        fileSize: 10000000
    },
    destination(req, file, cb) {
        const path = `./${env.FILE_DIRECTORY}/`
        // directory existence check and creation
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        cb(null, path);
    },
    filename(req, file, cb) {
        const newId = uuidv4()
        file.ext = (file.originalname).split('.').pop();
        file.date = moment().format('YYYY-MM-DD-hh-mm')
        file.id = newId

        cb(null, `${file.originalname}`);
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|openvpn)$/)) {
            return cb(new Error('File format is not supported'))
        }

        cb(undefined, true)
    }
});

module.exports = multer({ storage })
