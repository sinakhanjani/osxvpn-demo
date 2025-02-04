const message = require('../../scaffold/message.scaffold')
const Vps = require('../models/vps.model')
const Dashboard = require('../models/dashboard.model')
const UserVpn = require('../models/userVpn.model')
const Account = require('../models/account.model')
const Server = require('../models/server.model')

module.exports = {
    // For admin
    create: async function (req, res) {
        try {
            const vps = await Vps.create(req.body)

            res.scaffold.success(message.success)
        } catch (e) {
            console.log(e)
            res.scaffold.eFailed(e)
        }
    },
    update: async function (req, res) {
        try {
            const id = req.params.id
            const body = req.body

            await Vps.update(body, { where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    read: async function (req, res) {
        try {
            var where = req.query

            const vpns = await Vps.findAll({
                where,
                include: [
                    {
                        model: Dashboard,
                        as: 'dashboard'
                    }
                ]
            })

            res.scaffold.add(vpns)
        } catch (e) {
            console.log(e)
            res.scaffold.eFailed(e)
        }
    },
    delete: async function (req, res) {
        try {
            const id = req.params.id

            await Vps.destroy({ where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    updateProfile: async function (req, res) {
        try {
            if (req.file) {
                const vps = await Vps.findOne({ where: { id: req.params.id } })

                if (vps) {
                    vps.profile = req.file.originalname

                    await vps.save()

                    await Server.update({
                        profile: vps.protocol === 'cisco' ? 'cisco' : vps.profile
                    }, { where: { vpsId: vps.id } })

                    res.scaffold.success(message.success)
                } else {
                    res.scaffold.failed(message.notFound)
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    readCapicity: async function (req, res) {
        try {
            const vps = await Vps.findAll({
                attributes: ['capacity', 'connectionLimit', 'active', 'type', 'server', 'protocol', 'id']
            })
            res.scaffold.add(vps)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}