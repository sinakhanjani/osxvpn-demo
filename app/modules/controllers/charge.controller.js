const message = require('../../scaffold/message.scaffold')
const Charge = require('../models/charge.model')
const User = require('../models/user.model')
const UserVpn = require('../models/userVpn.model')
const Server = require('../models/server.model')
const Account = require('../models/account.model')
const moment = require('moment')
const { Op } = require("sequelize");

module.exports = {
    read: async function (req, res) {
        try {
            const charges = await Charge.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: moment().startOf('day').toString(),
                        [Op.lt]: moment().endOf('day').toString()
                    }
                },
                include: [
                    { model: User, as: 'user' },
                    {
                        model: UserVpn,
                        as: 'userVpn',
                        include: [
                            {
                                model: Server,
                                as: 'servers',
                            },
                            {
                                model: Account,
                                as: 'accounts',
                            }
                        ]
                    }
                ],
            })

            res.scaffold.add(charges)
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
}