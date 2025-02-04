const message = require('../../scaffold/message.scaffold')
const Admin = require('../models/admin.model')
const Charge = require('../models/charge.model')
const User = require('../models/user.model')

module.exports = {
    me: async function (req, res) {
        try {
            res.scaffold.add(req.user)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    charge: async function (req, res) {
        try {
            var where = req.query

            const charges = await Charge.findAll({
                where,
                include: [
                    {
                        model: Admin,
                        as: 'admin',
                    },
                    {
                        model: User,
                        as: 'user',
                    }
                ]
            })

            res.scaffold.add(charges)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    login: async function (req, res) {
        try {
            const email = req.body.email
            const password = req.body.password

            const admin = await Admin.findOne({ where: { email, password } })

            if (admin) {
                const jwtToken = admin.generateAuthToken()
                admin.tokens = jwtToken
                await admin.save()

                res.scaffold.add(admin)
            } else {
                res.scaffold.failed(message.userNotFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}