const Order = require('../models/order.model')
const Server = require('../models/server.model')
const UserVpn = require('../models/userVpn.model')
const message = require('../../scaffold/message.scaffold')

module.exports = {
    // MARK: - For admin
    readByAdmin: async function (req, res) {
        try {
            var where = req.query

            const orders = await Order.findAll({
                where,
                include: [
                    {
                        model: UserVpn,
                        as: 'userVpn',
                        include: [
                            {
                                model: Server,
                                as: 'servers',
                            }
                        ]
                    }
                ]
            })

            res.scaffold.add(orders)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },

    // MARK: - User
    read: async function (req, res) {
        try {
            // all
            var where = {
                userId: req.user.id,
            }

            if (typeof req.query.paid === 'string') {
                where.paid = req.query.paid
            }

            const orders = await Order.findAll({
                where,
            })

            res.scaffold.add(orders)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}
