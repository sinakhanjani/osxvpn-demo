const jwt = require('jsonwebtoken')
const scaffold = require('../scaffold/scaffold')
const message = require('../scaffold/message.scaffold')
const { Op } = require("sequelize");

const auth = async function (req, res, next) {
    res.scaffold = scaffold(res)
    
    next()
}

module.exports = auth