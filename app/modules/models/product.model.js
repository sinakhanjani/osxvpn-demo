const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')
const Order = require('./order.model')
const Vpn = require('./vpn.model')
const UserVpn = require('./userVpn.model')
const Vps = require('./vps.model')
const ibsng = require('../../helper/ibsng.helper')
const xui = require('../../helper/xui.helper')
const moment = require('moment')
const Server = require('./server.model')
const Account = require("./account.model")
const Dashboard = require('./dashboard.model')
const {
    v4: uuidv4,
} = require('uuid')
const trojan = require('../../helper/trojan.helper')

class Product extends Model {
    async createOrder(userId, paymentMethod) {
        try {
            const order = await Order.create({
                amount_rial: this.amount_rial,
                amount_dollar: this.amount_dollar,
                paid: false,
                userId,
                paymentMethod,
                type: 'create',
                hasDiscount: false,
                productId: this.id,
                creator: this.creator
            })

            return order
        } catch (e) {
            throw new Error(e)
        }
    }

    async createUserVpn(userId, user, unitPerGB = 1) {
        try {
            //3- create vpn
            //1- find product type
            const types = this.type.trim().split(',')

            const no = await UserVpn.count()
            const userVpn = await UserVpn.create({
                type: this.type,
                period: this.period,
                dayGift: user.isColleague === true ? 0 : this.dayGift,
                connectionLimit: this.connectionLimit,
                traffic: this.traffic,
                username: types.includes('trojan') ? `${this.randomCode4}${no + 1}` : `1${this.randomCode1}${no + 1}`,
                password: types.includes('trojan') ? this.randomCode6 : this.randomCode,
                expiredAt: this.dateAfter(this.period, user.isColleague === true ? 0 : this.dayGift),
                userId,
                productId: this.id,
                creator: 'system'
            })

            if (types.includes('ibs')) {
                const vps = await Vps.findOne({ order: sequelize.random(), where: { type: 'ibs', active: true, connectionLimit: this.connectionLimit } })

                if (vps) {
                    const protocol = vps.protocol
                    const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })

                    await Server.create({
                        server: vps.server,
                        port: vps.port,
                        type: vps.type,
                        userVpnId: userVpn.id,
                        userId: userVpn.userId,
                        vpsId: vps.id,
                        subject: vps.subject,
                        profile: vps.protocol === 'cisco' ? 'cisco' : vps.profile,
                        creator: 'system'
                    })
                    // add alternative cisco or l2tp server to user if availble
                    if (protocol === 'l2tp') {
                        const ciscoVps = await Vps.findOne({ order: sequelize.random(), where: { type: 'ibs', protocol: 'cisco', active: true, connectionLimit: this.connectionLimit } })

                        if (ciscoVps) {
                            await Server.create({
                                server: ciscoVps.server,
                                port: ciscoVps.port,
                                type: ciscoVps.type,
                                userVpnId: userVpn.id,
                                userId: userVpn.userId,
                                vpsId: ciscoVps.id,
                                subject: ciscoVps.subject,
                                profile: ciscoVps.protocol === 'cisco' ? 'cisco' : ciscoVps.profile,
                                creator: 'system'
                            })
                        }
                    }
                    if (protocol === 'cisco') {
                        const l2tpVps = await Vps.findOne({ order: sequelize.random(), where: { type: 'ibs', protocol: 'l2tp', active: true, connectionLimit: this.connectionLimit } })

                        if (l2tpVps) {
                            await Server.create({
                                server: l2tpVps.server,
                                port: l2tpVps.port,
                                type: l2tpVps.type,
                                userVpnId: userVpn.id,
                                userId: userVpn.userId,
                                vpsId: l2tpVps.id,
                                subject: l2tpVps.subject,
                                profile: l2tpVps.protocol === 'cisco' ? 'cisco' : l2tpVps.profile,
                                creator: 'system'
                            })
                        }
                    }

                    const connectionLimit = this.connectionLimit === 1 ? 'User1' : 'Business'
                    const objectId = await ibsng(dashboard).addCount(connectionLimit)
                    //
                    if (objectId) {
                        const account = await Account.create({
                            internalId: `${objectId}`,
                            type: 'ibs',
                            userVpnId: userVpn.id,
                            userId: userVpn.userId,
                        })

                        if (account) {
                            ibsng(dashboard).addUser(userVpn, account)
                            ibsng(dashboard).addExpirationDate(userVpn, account)
                            ibsng(dashboard).addMultiLogin(userVpn, account)
                            ibsng(dashboard).addTraffic(userVpn, account)
                        }
                    }
                }
            }

            if (types.includes('v2ray')) {
                const vps = await Vps.findOne({ order: sequelize.random(), where: { type: 'v2ray', active: true } })

                if (vps) {
                    const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })
                    const server = await Server.create({
                        server: vps.server,
                        port: vps.port,
                        type: vps.type,
                        userVpnId: userVpn.id,
                        userId: userVpn.userId,
                        vpsId: vps.id,
                        subject: vps.subject,
                        creator: 'system',
                        profile: vps.protocol === 'cisco' ? 'cisco' : vps.profile,
                    })
                    const accountCount = await Account.count()
                    const link = await xui(dashboard).addUser(userVpn, accountCount, uuidv4(), vps, unitPerGB)
                    // set the activate link to username.
                    if (link) {
                        await Account.create({
                            internalId: `${userVpn.username}`,
                            type: 'v2ray',
                            userVpnId: userVpn.id,
                            userId: userVpn.userId,
                        })

                        server.server = link
                        await server.save()
                    }
                }
            }

            if (types.includes('trojan')) {
                const dashboard = await Dashboard.findOne({ order: sequelize.random(), where: { protocol: 'trojan', active: true } })

                if (dashboard) {
                    const addUser = await trojan(dashboard).addUser(userVpn, unitPerGB)

                    if (addUser) {
                        await Account.create({
                            internalId: `${addUser.id}`,
                            type: 'trojan',
                            userVpnId: userVpn.id,
                            userId: userVpn.userId,
                            dashboardId: dashboard.id
                        })
                    }
                }
            }

            return userVpn
        } catch (e) {
            console.log(e);
            throw new Error(e)
        }
    }

    // Use this method only when this.productId !== userVpn.productId
    async updateUserVpn(userVpn, user, unitPerGB = 1) {
        try {
            if (moment(userVpn.expiredAt).toDate() < moment().add(400, 'd').toDate()) {
                const diffDays = moment(userVpn.expiredAt).diff(moment(), 'days')
                const remainDays = diffDays >= 0 ? diffDays : 0

                const accounts = await Account.findAll({ where: { userVpnId: userVpn.id } })

                const ibsAccount = accounts.find((account) => (account.type === 'ibs'))
                const v2rayAccount = accounts.find((account) => (account.type === 'v2ray'))
                const trojanAccount = accounts.find((account) => (account.type === 'trojan'))

                if (trojanAccount) {
                    const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: trojanAccount.dashboardId } })

                    if (dashboard) {
                        // add new expration date
                        userVpn.type = this.type
                        userVpn.period = this.period
                        userVpn.dayGift = user.isColleague === true ? 0 : this.dayGift
                        userVpn.connectionLimit = this.connectionLimit
                        userVpn.traffic = this.traffic
                        userVpn.productId = this.id
                        userVpn.expiredAt = this.dateAfter(this.period, user.isColleague === true ? 0 : this.dayGift)
                        await userVpn.save()
                        // update on trojan panel
                        trojan(dashboard).updateUser(userVpn, unitPerGB)
                        if (user.isColleague === true) {

                        }
                    }
                }

                if (ibsAccount) {
                    const server = await Server.findOne({ where: { userVpnId: userVpn.id } })
                    const vps = await Vps.findOne({ where: { server: server.server } })

                    if (vps) {
                        const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })

                        if (dashboard) {
                            // add new expration date
                            userVpn.type = this.type
                            userVpn.period = this.period
                            userVpn.dayGift = user.isColleague === true ? 0 : this.dayGift
                            userVpn.connectionLimit = this.connectionLimit
                            userVpn.traffic = this.traffic
                            userVpn.productId = this.id
                            userVpn.expiredAt = this.dateAfter(this.period, user.isColleague === true ? 0 : this.dayGift, remainDays)
                            // add to ibs
                            ibsng(dashboard).addExpirationDate(userVpn, ibsAccount)
                            if (user.isColleague === true) {
                                // change password for colleague
                                // userVpn.password = this.randomCode
                                // edit password on ibsn
                                ibsng(dashboard).addUser(userVpn, ibsAccount)
                            }
                            ibsng(dashboard).addMultiLogin(userVpn, ibsAccount)
                            ibsng(dashboard).addTraffic(userVpn, ibsAccount)
                            // save
                            await userVpn.save()
                        }
                    }
                }

                if (v2rayAccount) {
                    const server = await Server.findOne({ where: { userVpnId: userVpn.id } })
                    const vps = await Vps.findOne({ where: { server: server.server } })

                    if (vps) {
                        const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })

                        if (dashboard) {
                            userVpn.type = this.type
                            userVpn.period = this.period
                            userVpn.dayGift = user.isColleague === true ? 0 : this.dayGift
                            userVpn.connectionLimit = this.connectionLimit
                            userVpn.traffic = this.traffic
                            userVpn.productId = this.id
                            userVpn.expiredAt = this.dateAfter(this.period, user.isColleague === true ? 0 : this.dayGift, remainDays)
                            await userVpn.save()
                            // add t xui
                            xui(dashboard).updateUser(userVpn, v2rayAccount, unitPerGB)
                            if (user.isColleague === true) {

                            }
                        }
                    }
                }
            }

            return userVpn
        } catch (e) {
            throw new Error(e)
        }
    }

    dateAfter(period, dayGift, remainDays = 0) {
        switch (period) {
            case '1m': return moment().add(dayGift + 30 + remainDays, 'day').toDate()
            case '2m': return moment().add(dayGift + 60 + remainDays, 'day').toDate()
            case '3m': return moment().add(dayGift + 90 + remainDays, 'day').toDate()
            case '6m': return moment().add(dayGift + 180 + remainDays, 'day').toDate()
            case '1y': return moment().add(dayGift + 365 + remainDays, 'day').toDate()
            default: return moment().add(dayGift + 30 + remainDays, 'day').toDate()
        }
    }

    get randomCode() {
        const min = 1000
        const max = 9999
        const digit = Math.floor(Math.random() * (max - min + 1)) + min

        return String(digit)
    }

    get randomCode1() {
        const min = 1
        const max = 9
        const digit = Math.floor(Math.random() * (max - min + 1)) + min

        return String(digit)
    }

    get randomCode6() {
        const min = 100000
        const max = 999999
        const digit = Math.floor(Math.random() * (max - min + 1)) + min

        return String(digit)
    }

    get randomCode4() {
        const min = 1000
        const max = 9999
        const digit = Math.floor(Math.random() * (max - min + 1)) + min

        return String(digit)
    }
}

Product.init({
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    promot: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    period: {
        type: DataTypes.ENUM('1m', '2m', '3m', '6m', '1y'),
        allowNull: false,
    },
    dayGift: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    connectionLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
    },
    traffic: {
        type: DataTypes.ENUM('1gb', '12gb', '24gb', '48gb', '100gb', '200gb', '400gb', 'unlimited'),
        allowNull: false,
    },
    amount_rial: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount_dollar: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    creator: {
        type: Sequelize.ENUM('admin', 'system'),
        allowNull: false,
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeBulkDestroy: async (product) => {
            await Vpn.destroy({
                where: { productId: product.where.id }
            })
        },
        afterBulkUpdate: async (product) => {
            attr = product.attributes

            await Vpn.update(
                {
                    traffic: attr.traffic,
                    dayGift: attr.dayGift,
                    period: attr.period,
                    connectionLimit: attr.connectionLimit,
                    type: attr.type,
                },
                {
                    where: { productId: product.where.id, used: false }
                }
            )

        }
    }
})

module.exports = Product