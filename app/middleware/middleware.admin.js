const jwt = require('jsonwebtoken')
const Admin = require('../modules/models/admin.model')
const scaffold = require('../scaffold/scaffold')
const message = require('../scaffold/message.scaffold')
const { Op } = require("sequelize");
require('dotenv').config()
const config = require('config')
const env = config.get('env')

const auth = async function (req, res, next) {
    res.scaffold = scaffold(res)

    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '')
        
        const decodedJWT = jwt.verify(token, env.JWT_SECRET_ADMIN)
        const admin = await Admin.findOne({
            where: {
                [Op.and]: [
                    { id: decodedJWT._id },
                    {
                        tokens: token
                    }
                ]
            }
        })
    
        if (admin) {
            req.user = admin
            req.token = token
            
            next()
        } else {
            scaffold(res).failed(message.authenticate)
        }
    } else {
        scaffold(res).failed(message.authenticate)
    }
}

module.exports = auth