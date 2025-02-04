const Vpn = require('../models/vpn.model')
const UserVpn = require('../models/userVpn.model')
const Product = require('../models/product.model')
const message = require('../../scaffold/message.scaffold')
const Vps = require('../models/vps.model')

module.exports = {
    // MARK: - For admin
    // this req for find all vpn added to db and also filter by user(email)
    read: async function (req, res) {
        try {
            var where = req.query

            const vpns = await Vpn.findAll({ where })

            res.scaffold.add(vpns)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    delete: async function (req, res) {
        try {
            const id = req.params.id

            await Vpn.destroy({ where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    deleteMany: async function (req, res) {
        try {
            const where = req.body

            await Vpn.destroy({ where })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    update: async function (req, res) {
        try {
            const id = req.params.id
            const body = req.body

            await Vpn.update(body, { where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    updateMany: async function (req, res) {
        try {
            const body = req.body.vpn
            const where = req.body.where

            await Vpn.update(body, { where })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    create: async function (req, res) {
        try {
            const productId = req.params.productId

            const product = await Product.findOne({ where: { id: productId } })

            if (product) {
                const vpns = req.body.map((vpn) => ({
                    productId,
                    type: product.type,
                    connectionLimit: product.connectionLimit,
                    traffic: product.traffic,
                    username: vpn.username,
                    password: vpn.password,
                    period: product.period,
                    dayGift: product.dayGift,
                    vpsId: vpn.vpsId
                }))

                await Vpn.bulkCreate(vpns)

                res.scaffold.success(message.success)
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    updateUserVpnIBS: async function (req, res) {
        try {
            const beforeVpsId = req.body.beforeVpsId
            const afterVpsId = req.body.afterVpsId

            const afterVps = await Vps.findOne({ where: { id: afterVpsId } })

            if (afterVps && (afterVps.type === 'ibs')) {
                await Server.update({
                    subject: afterVps.subject,
                    server: afterVps.server,
                    port: afterVps.port,
                    type: afterVps.type,
                    vpsId: afterVpsId.id,
                    profile: afterVpsId.protocol === 'cisco' ? 'cisco' : afterVpsId.profile
                }, { where: { vpsId: beforeVpsId.id, creator: 'admin' } })

                res.scaffold.success(message.success)
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}
