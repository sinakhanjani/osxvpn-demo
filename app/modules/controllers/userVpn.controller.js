const Vpn = require('../models/vpn.model')
const UserVpn = require('../models/userVpn.model')
const Product = require('../models/product.model')
const Server = require('../models/server.model')
const Account = require('../models/account.model')
const ibsng = require('../../helper/ibsng.helper')
const Wallet = require('../models/wallet.model')
const xui = require('../../helper/xui.helper')
const User = require('../models/user.model')
const message = require('../../scaffold/message.scaffold')
const Dashboard = require('../models/dashboard.model')
const Vps = require('../models/vps.model')
const Charge = require('../models/charge.model')
const sequelize = require('../../db/sequelize')
const {
    v4: uuidv4,
} = require('uuid')
const e = require('express')
const trojan = require('../../helper/trojan.helper')

module.exports = {
    // MARK: - For admin
    // this req for find all vpn added to db and also filter by user(email)
    read: async function (req, res) {
        try {
            var where = req.query

            const vpns = await UserVpn.findAll({
                where,
                include: [
                    {
                        model: Server,
                        as: 'servers'
                    },
                    {
                        model: Account,
                        as: 'accounts'
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['email', 'id']
                    },
                ],
                order: [
                    ['createdAt', 'ASC'],
                ],
            })

            res.scaffold.add(vpns)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    updateByAdmin: async function (req, res) {
        try {
            const id = req.params.id
            const body = req.body

            await UserVpn.update(body, { where: { id, creator: 'admin' } })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    updateMany: async function (req, res) {
        try {
            const body = req.body.userVpn
            const where = req.body.where

            await UserVpn.update(body,
                {
                    ...where,
                    creator: 'admin'
                })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    createByAdmin: async function (req, res) {
        try {
            const vpnId = req.body.vpnId
            const userId = req.body.userId

            const vpn = await Vpn.findOne({ where: { id: vpnId, used: false } })

            if (vpn) {
                const userVpn = await vpn.createUserVpn(userId)

                if (userVpn) {
                    const product = await Product.findOne({ where: { id: vpn.productId } })
                    const user = await User.findOne({ where: { id: userId } })
                    const wallet = await Wallet.findOne({ where: { userId } })

                    if (product && user && wallet) {
                        await Charge.create({
                            amount_rial: 0,
                            amount_dollar: product.amount_dollar,
                            userId,
                            walletId: wallet.id,
                            adminId: req.user.id,
                            userVpnId: userVpn.id
                        })

                        res.scaffold.add(userVpn)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
                } else {
                    res.scaffold.failed(message.vpnFinished)
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    createBySystem: async function (req, res) {
        try {
            const productId = req.body.productId
            const userId = req.body.userId
            const unitPerGB = req.body.unitPerGB ?? 1

            const product = await Product.findOne({ where: { id: productId } })
            const user = await User.findOne({ where: { id: userId } })
            const wallet = await Wallet.findOne({ where: { userId } })

            if (product && user && wallet) {
                const updatedUserVpn = await product.createUserVpn(userId, user, unitPerGB)

                await Charge.create({
                    amount_rial: 0,
                    amount_dollar: product.amount_dollar * unitPerGB,
                    userId,
                    walletId: wallet.id,
                    adminId: req.user.id,
                    userVpnId: updatedUserVpn.id
                })

                res.scaffold.add(updatedUserVpn)
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    updateBySystem: async function (req, res) {
        try {
            const productId = req.body.productId
            const userVpnId = req.body.userVpnId
            const unitPerGB = req.body.unitPerGB ?? 1

            const product = await Product.findOne({ where: { id: productId } })

            if (product) {
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId, creator: 'system' } })

                if (product.type === userVpn.type) {
                    if (userVpn) {
                        const user = await User.findOne({ where: { id: userVpn.userId } })
                        const wallet = await Wallet.findOne({ where: { userId: userVpn.userId } })

                        if (user && wallet) {
                            const updatedUserVpn = await product.updateUserVpn(userVpn, user, unitPerGB)

                            await Charge.create({
                                amount_rial: 0,
                                amount_dollar: product.amount_dollar * unitPerGB,
                                userId: userVpn.userId,
                                walletId: wallet.id,
                                adminId: req.user.id,
                                userVpnId: updatedUserVpn.id
                            })

                            res.scaffold.add(updatedUserVpn)
                        } else {
                            res.scaffold.failed(message.notFound)
                        }
                    } else {
                        res.scaffold.failed(message.badVps)
                    }
                } else {
                    res.scaffold.failed(message.productIsInvalid)
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    delete: async function (req, res) {
        try {
            const id = req.params.id

            await UserVpn.destroy({ where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            console.log(e)
            res.scaffold.eFailed(e)
        }
    },
    // Admin: V2ray 
    readTrojanByAdmin: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId

            const account = await Account.findOne({ where: { userVpnId } })

            if (account) {
                const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId } })

                if (dashboard && userVpn) {
                    const user = await trojan(dashboard).readUser(userVpn)

                    if (user) {
                        res.scaffold.add(user)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
                } else {
                    res.scaffold.failed(message.notFound)
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
    readNodeListByAdmin: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId

            const account = await Account.findOne({ where: { userVpnId } })

            if (account) {
                const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId } })

                if (dashboard && userVpn) {
                    const nodeList = await trojan(dashboard).nodeRead(userVpn)

                    if (nodeList) {
                        res.scaffold.add(nodeList)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
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
    readNodeURLByAdmin: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const trojanAccount = req.body

            const account = await Account.findOne({ where: { userVpnId } })

            if (account) {
                const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId } })

                if (dashboard && userVpn) {
                    const nodeList = await trojan(dashboard).nodeURL(userVpn, trojanAccount)

                    if (nodeList) {
                        res.scaffold.add(nodeList)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
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
    //MARK: For User
    traffic: async function (req, res) {
        try {
            const id = req.params.serverId // serverID
            const server = await Server.findOne({ where: { id } })
            const vps = await Vps.findOne({ where: { server: server.server } })

            if (vps) {
                const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })
                const account = await Account.findOne({ where: { userVpnId: server.userVpnId, userId: req.user.id } })

                if (account) {
                    var traffic = '--'

                    if (vps.type == 'ibs') {
                        traffic = await ibsng(dashboard).userMonthlyTraffic(account)
                    }
                    if (vps.type === 'v2ray') {
                        traffic = await xui(dashboard).userMonthlyTraffic(account)
                    }

                    res.scaffold.add({
                        traffic
                    })
                } else {
                    res.scaffold.failed(message.notFound)
                }
            } else {
                res.scaffold.failed(message.badVps)
            }
        } catch (e) {
            console.log(e)
            res.scaffold.eFailed(e)
        }
    },
    updateDashboardAccounts: async function (req, res) {
        try {
            const userVpnId = req.params.id

            const userVpn = await UserVpn.findOne({ where: { id: userVpnId, creator: 'system' } })

            if (userVpn) {
                const account = await Account.findOne({ where: { userVpnId } })

                if (!account) {
                    const server = await Server.findOne({ where: { userVpnId } })

                    if (server) {
                        const vps = await Vps.findOne({ where: { server: server.server } })

                        if (vps) {
                            const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })

                            if (vps.type === 'ibs') {
                                const connectionLimit = userVpn.connectionLimit === 1 ? 'User1' : 'Business'
                                const objectId = await ibsng(dashboard).addCount(connectionLimit)

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

                                    res.scaffold.add(account)
                                } else {
                                    res.scaffold.failed(message.badRequest)
                                }
                            }
                            if (vps.type === 'v2ray') {
                                {
                                    // v2ray
                                    const accountCount = await Account.count()
                                    const link = await xui(dashboard).addUser(userVpn, accountCount, uuidv4(), vps)
                                    // set the activate link to username.
                                    if (link) {
                                        await Account.create({
                                            internalId: `${userVpn.username}`,
                                            type: 'v2ray',
                                            userVpnId: userVpn.id,
                                            userId: userVpn.userId,
                                        })
                                        // update server link.
                                        server.server = link

                                        await server.save()
                                    }
                                }
                            }
                        } else {
                            res.scaffold.failed(message.notFound)
                        }
                    } else {
                        const vps = await Vps.findOne({ order: sequelize.random(), where: { type: userVpn.type, active: true, connectionLimit: userVpn.connectionLimit } })

                        if (vps) {
                            const protocol = vps.protocol

                            const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })

                            if (dashboard) {
                                const server = await Server.create({
                                    server: vps.server,
                                    port: vps.port,
                                    type: vps.type,
                                    userVpnId: userVpn.id,
                                    vpsId: vps.id,
                                    userId: userVpn.userId,
                                    subject: vps.subject,
                                    profile: vps.protocol === 'cisco' ? 'cisco' : vps.profile,
                                    creator: 'system',
                                })

                                if (vps.type === 'ibs') {
                                    // add alternative cisco or l2tp server to user if availble
                                    if (protocol === 'l2tp') {
                                        const ciscoVps = await Vps.findOne({ order: sequelize.random(), where: { type: 'ibs', protocol: 'cisco', active: true, connectionLimit: userVpn.connectionLimit } })

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
                                        const l2tpVps = await Vps.findOne({ order: sequelize.random(), where: { type: 'ibs', protocol: 'l2tp', active: true, connectionLimit: userVpn.connectionLimit } })

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

                                    const connectionLimit = userVpn.connectionLimit === 1 ? 'User1' : 'Business'
                                    const objectId = await ibsng(dashboard).addCount(connectionLimit)

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

                                if (vps.type === 'v2ray') {
                                    // v2ray
                                    const accountCount = await Account.count()
                                    const link = await xui(dashboard).addUser(userVpn, accountCount, uuidv4(), vps)
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

                                res.scaffold.failed(message.success)
                            } else {
                                res.scaffold.failed(message.notFound)
                            }
                        } else {
                            res.scaffold.failed(message.badVps)
                        }
                    }
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
    readTrojan: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId

            const account = await Account.findOne({ where: { userVpnId } })

            if (account) {
                const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })

                if (dashboard && userVpn) {
                    const user = await trojan(dashboard).readUser(userVpn)

                    if (user) {
                        res.scaffold.add(user)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
                } else {
                    res.scaffold.failed(message.notFound)
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
    readNodeList: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId

            const account = await Account.findOne({ where: { userVpnId } })

            if (account) {
                const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })

                if (dashboard && userVpn) {
                    const nodeList = await trojan(dashboard).nodeRead(userVpn)

                    if (nodeList) {
                        res.scaffold.add(nodeList)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
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
    readNodeURL: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const trojanAccount = req.body

            const account = await Account.findOne({ where: { userVpnId } })

            if (account) {
                const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })

                if (dashboard && userVpn) {
                    const nodeList = await trojan(dashboard).nodeURL(userVpn, trojanAccount)

                    if (nodeList) {
                        res.scaffold.add(nodeList)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
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
    readNodeQR: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const trojanAccount = req.body

            const account = await Account.findOne({ where: { userVpnId } })

            if (account) {
                const dashboard = await Dashboard.findOne({ where: { protocol: 'trojan', id: account.dashboardId } })
                const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })

                if (dashboard && userVpn) {
                    const nodeList = await trojan(dashboard).nodeQR(userVpn, trojanAccount)

                    if (nodeList) {
                        res.scaffold.add(nodeList)
                    } else {
                        res.scaffold.failed(message.notFound)
                    }
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
    addNote: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const note = req.body.note

            const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })

            if (userVpn) {
                userVpn.note = note
                await userVpn.save({ silent: true })

                res.scaffold.success(message.success)
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    lockAndUnlock: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const isLock = req.body.isLock

            const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })
            const account = await Account.findOne({ where: { userVpnId: userVpn.id } })

            if (userVpn && account) {
                //protocol
                var dashboard

                if (userVpn.type === 'ibs') {
                    dashboard = await Dashboard.findOne({ where: { protocol: userVpn.type === 'ibs' ? 'ibs' : 'trojan' } })
                } else {
                    dashboard = await Dashboard.findOne({ where: { protocol: userVpn.type === 'ibs' ? 'ibs' : 'trojan', id: account.dashboardId } })
                }

                if (dashboard) {
                    userVpn.isLock = isLock

                    if (userVpn.type === 'ibs') {
                        await ibsng(dashboard).lockAndUnLockUser(isLock, account)
                    } else {
                        await trojan(dashboard).lockAndUnLockUser(isLock, userVpn)
                    }

                    await userVpn.save({ silent: true })

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
    lockAndUnlockByAdmin: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const isLock = req.body.isLock

            const userVpn = await UserVpn.findOne({ where: { id: userVpnId } })
            const account = await Account.findOne({ where: { userVpnId: userVpn.id } })

            if (userVpn && account) {
                //protocol
                var dashboard

                if (userVpn.type === 'ibs') {
                    dashboard = await Dashboard.findOne({ where: { protocol: userVpn.type === 'ibs' ? 'ibs' : 'trojan' } })
                } else {
                    dashboard = await Dashboard.findOne({ where: { protocol: userVpn.type === 'ibs' ? 'ibs' : 'trojan', id: account.dashboardId } })
                }

                if (dashboard) {
                    userVpn.isLock = isLock

                    if (userVpn.type === 'ibs') {
                        await ibsng(dashboard).lockAndUnLockUser(isLock, account)
                    } else {
                        await trojan(dashboard).lockAndUnLockUser(isLock, userVpn)
                    }

                    await userVpn.save({ silent: true })

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
    editPasswordByAdmin: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const password = req.body.password

            const userVpn = await UserVpn.findOne({ where: { id: userVpnId } })

            if (userVpn) {
                //protocol
                const dashboard = await Dashboard.findOne({ where: { protocol: 'ibs' } })
                const account = await Account.findOne({ where: { userVpnId: userVpn.id } })

                if (dashboard && account) {
                    // change password for colleague
                    userVpn.password = password
                    // edit password on ibsn
                    await ibsng(dashboard).addUser(userVpn, account)
                    await userVpn.save({ silent: true })

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
    editPassword: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId
            const password = req.body.password

            const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })

            if (userVpn) {
                //protocol
                const dashboard = await Dashboard.findOne({ where: { protocol: 'ibs' } })
                const account = await Account.findOne({ where: { userVpnId: userVpn.id } })

                if (dashboard && account) {
                    // change password for colleague
                    userVpn.password = password
                    // edit password on ibsn
                    await ibsng(dashboard).addUser(userVpn, account)
                    await userVpn.save({ silent: true })

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
    logByAdmin: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId

            const dashboard = await Dashboard.findOne({ where: { protocol: 'ibs' } })
            const userVpn = await UserVpn.findOne({ where: { id: userVpnId } })

            if (userVpn && dashboard) {
                const json = await ibsng(dashboard).connectionLog(userVpn)

                res.scaffold.add(json)
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    log: async function (req, res) {
        try {
            const userVpnId = req.params.userVpnId

            const dashboard = await Dashboard.findOne({ where: { protocol: 'ibs' } })
            const userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId: req.user.id } })

            if (userVpn && dashboard) {
                const json = await ibsng(dashboard).connectionLog(userVpn)

                res.scaffold.add(json)
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}
