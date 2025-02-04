const Product = require('../models/product.model')
const User = require('../models/user.model')
const message = require('../../scaffold/message.scaffold')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const config = require('config')
const env = config.get('env')
const { Op } = require("sequelize")

module.exports = {
    // MARK: - For admin
    // this req for find all vpn added to db and also filter by user(email)
    readByAdmin: async function (req, res) {
        try {
            var where = req.query

            const products = await Product.findAll({
                where
            })

            res.scaffold.add(products)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    delete: async function (req, res) {
        try {
            // delete vpn for admin
            const id = req.params.id

            await Product.destroy({
                where: {
                    id
                }
            })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    update: async function (req, res) {
        try {
            // update vpn for admin
            const id = req.params.id
            const body = req.body

            await Product.update(body, {
                where: {
                    id
                }
            })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    create: async function (req, res) {
        try {
            // update vpn for admin
            await Product.create(req.body)

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    // MARK: - Common
    read: async function (req, res) {
        try {
            const products = await Product.findAll({
                where: { active: true }, order: [['createdAt', 'DESC']]
            })

            res.scaffold.add(products)
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
}
