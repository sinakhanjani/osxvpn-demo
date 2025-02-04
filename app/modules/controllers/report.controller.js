const message = require('../../scaffold/message.scaffold')
const Charge = require('../models/charge.model')
const User = require('../models/user.model')
const UserVpn = require('../models/userVpn.model')
const Server = require('../models/server.model')
const Account = require('../models/account.model')
const Vps = require('../models/vps.model')
var moment = require('jalali-moment');
const { Op } = require("sequelize");
const { Sequelize } = require('sequelize')
const Admin = require('../models/admin.model')

const dollar = 1

module.exports = {
    read: async function (req, res) {
        try {
            const expiredUserVpnCount = await UserVpn.count({
                where: {
                    expiredAt: {
                        [Op.lt]: moment().endOf('day').toString()
                    }
                }
            })
            const activeUserVpnCount = await UserVpn.count({
                where: {
                    expiredAt: {
                        [Op.gt]: moment().startOf('day').toString(),
                    }
                }
            })
            const createdUserVpnToday = await UserVpn.count({
                where: {
                    createdAt: {
                        [Op.gt]: moment().startOf('day').toString(),
                        [Op.lt]: moment().endOf('day').toString()
                    }
                },
                include: [
                    { model: User, as: 'user' },
                ]
            })
            const updatedUserVpnToday = await UserVpn.count({
                where: {
                    updatedAt: {
                        [Op.gt]: moment().startOf('day').toString(),
                        [Op.lt]: moment().endOf('day').toString()
                    }
                },
                include: [
                    { model: User, as: 'user' },
                ]
            })
            const totalTodayIncome = await Charge.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: moment().tz("Asia/Tehran").startOf('day').toString(),
                        [Op.lt]: moment().tz("Asia/Tehran").endOf('day').toString()
                    }
                },
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.col("amount_dollar")), "totalTodayIncome"],
                ]
            })
            const totalThisMonthIncome = await Charge.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: moment().locale('fa', { useGregorianParser: true }).startOf('month').toString(),
                        [Op.lt]: moment().locale('fa', { useGregorianParser: true }).endOf('month').toString()
                    }
                },
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount_dollar"), 'integer')), "totalThisMonthIncome"],
                ]
            })
            const totalLastMonthIncome = await Charge.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: moment().locale('fa', { useGregorianParser: true }).add(-1, 'month').startOf('month').toString(),
                        [Op.lt]: moment().locale('fa', { useGregorianParser: true }).add(-1, 'month').endOf('month').toString()
                    }
                },
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount_dollar"), 'integer')), "totalLastMonthIncome"],
                ]
            })
            const allUpdatedTodayUserVpn = await UserVpn.findAll({
                where: {
                    updatedAt: {
                        [Op.gt]: moment().startOf('day').toString(),
                        [Op.lt]: moment().endOf('day').toString()
                    }
                },
                include: [
                    { model: User, as: 'user' },
                ]
            })
            var serverReports = []
            var adminReports = []

            const vpses = await Vps.findAll()
            const admins = await Admin.findAll()

            await Promise.all(vpses.map(async function (vps) {
                const count = await Server.count({
                    where: {
                        server: vps.server
                    }
                })

                serverReports.push({
                    server: vps.server,
                    count
                })
            }))
            await Promise.all(admins.map(async function (admin) {
                const adminTotal = await Charge.findAll({
                    where: {
                        adminId: admin.id,
                        createdAt: {
                            [Op.gt]: moment().locale('fa', { useGregorianParser: true }).startOf('month').toString(),
                            [Op.lt]: moment().locale('fa', { useGregorianParser: true }).endOf('month').toString()
                        }
                    },
                    attributes: [
                        [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount_dollar"), 'integer')), "adminTotal"],
                    ]
                })

                adminReports.push({
                    admin: admin.email,
                    total: dollar * parseFloat(adminTotal[0]?.dataValues.adminTotal ?? 0)
                })
            }))

            res.scaffold.add({
                allUpdatedTodayUserVpn,
                expiredUserVpnCount,
                activeUserVpnCount,
                createdUserVpnToday,
                updatedUserVpnToday: ((updatedUserVpnToday - createdUserVpnToday) >= 0) ? updatedUserVpnToday - createdUserVpnToday : 0,
                totalTodayIncome: dollar * parseFloat(totalTodayIncome[0]?.dataValues.totalTodayIncome ?? 0),
                totalThisMonthIncome: dollar * parseFloat(totalThisMonthIncome[0]?.dataValues.totalThisMonthIncome ?? 0),
                totalLastMonthIncome: dollar * parseFloat(totalLastMonthIncome[0]?.dataValues.totalLastMonthIncome ?? 0),
                serverReports,
                adminReports
            })
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
}