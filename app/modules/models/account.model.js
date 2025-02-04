const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')
const ibsng = require('../../helper/ibsng.helper')
const xui = require('../../helper/xui.helper')
const Dashboard = require('./dashboard.model')
const Server = require('./server.model')
const Vps = require('./vps.model')
const trojan = require('../../helper/trojan.helper')
class Account extends Model {

}

Account.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    internalId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('ibs', 'v2ray', 'trojan'),
        allowNull: false,
    },
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeBulkDestroy: async (accountDes) => {
            const userVpnId = accountDes.where.userVpnId
            const userId = accountDes.where.userId

            if (userVpnId || userId) {
                var account
                var server

                if (userVpnId) {
                    account = await Account.findOne({ where: { userVpnId } })
                    server = await Server.findOne({ where: { userVpnId } })
                }
                if (userId) {
                    account = await Account.findOne({ where: { userId } })
                    server = await Server.findOne({ where: { userId } })
                }

                if (account && account.type === 'trojan') {
                    const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })

                    if (dashboard) {
                        trojan(dashboard).deleteUser(account)
                    }
                }

                if (server && account) {
                    const vps = await Vps.findOne({ where: { server: server.server } })

                    if (vps) {
                        const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })

                        if (account.type === 'ibs') {
                            ibsng(dashboard).deleteUser(account)
                        }
                        if (account.type === 'v2ray') {
                            xui(dashboard).deleteUser(account)
                        }
                    }
                }
            }
        }
    }
})

module.exports = Account