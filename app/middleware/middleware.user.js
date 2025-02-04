const jwt = require('jsonwebtoken')
const User = require('../modules/models/user.model')
const UserVpn = require('../modules/models/userVpn.model')
const Wallet = require('../modules/models/wallet.model')
const Server = require('../modules/models/server.model')
const scaffold = require('../scaffold/scaffold')
const message = require('../scaffold/message.scaffold')
const { Op } = require("sequelize")
require('dotenv').config()
const config = require('config')
const Account = require('../modules/models/account.model')
const env = config.get('env')

const auth = async function (req, res, next) {
    res.scaffold = scaffold(res)

    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decodedJWT = jwt.verify(token, env.JWT_SECRET_USER)

        const user = await User.findOne({
            where: {
                [Op.and]: [
                    { id: decodedJWT._id },
                    {
                        tokens: token
                    }
                ]
            },
            include: [
                {
                    model: UserVpn,
                    as: 'userVpns',
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
                },
                {
                    model: Wallet,
                    as: 'wallet',
                    attributes: ['amount_dollar']
                }
            ],
            order: [
                [{ model: UserVpn, as: 'userVpns' }, 'createdAt', 'ASC']
            ],
        })

        if (user) {
            req.user = user
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