const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')
const Server = require('./server.model')
const Dashboard = require('./dashboard.model')
const xui = require('../../helper/xui.helper')
const {
    v4: uuidv4,
} = require('uuid')

async function importV2ray(values) {
    // v2ray
    const servers = await Server.findAll({
        where: {
            [Op.and]: [
                { type: values.type },
                { creator: 'system' },
                {
                    [Op.or]: [
                        { expired: true },
                        { vpsId: null },
                    ]
                }
            ]
        }
    })
    const dashboard = await Dashboard.findOne({ where: { id: values.dashboardId } })

    if (servers && dashboard) {
        await Promise.all(servers.map(async function (server) {
            const UserVpn = require('./userVpn.model')
            const userVpn = await UserVpn.findOne({ where: { id: server.userVpnId } })

            if (userVpn) {
                const Account = require('./account.model')
                const accountCount = await Account.count()
                const link = await xui(dashboard).addUser(userVpn, accountCount, uuidv4(), values)

                if (link) {
                    // Then update:
                    await Server.update({
                        subject: values.subject,
                        server: values.server,
                        port: values.port,
                        type: values.type,
                        vpsId: values.id,
                        expired: false,
                        profile: values.protocol === 'cisco' ? 'cisco' : values.profile
                    }, {
                        where: {
                            [Op.and]: [
                                { type: values.type },
                                { creator: 'system' },
                                {
                                    [Op.or]: [
                                        { expired: true },
                                        { vpsId: null },
                                        { vpsId: values.id }
                                    ]
                                }
                            ]
                        }
                    })

                    server.server = link
                    await server.save()
                }
            }
        }))
    }
}

class Vps extends Model {
    //
}

Vps.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    server: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    port: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('ibs', 'v2ray', 'trojan'),
        allowNull: false,
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    connectionLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
    },
    capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    hooks: {
        afterCreate: async (vps) => {
            // add server to the userVpn has no server
            const values = vps.dataValues
            // MARK: First add to db
            if (values.type === 'ibs') {
                var where = {}

                if (values.protocol === 'cisco') {
                    where = {
                        [Op.and]: [
                            { type: values.type },
                            { creator: 'system' },
                            { profile: 'cisco' },
                            {
                                [Op.or]: [
                                    { expired: true },
                                    { vpsId: null },
                                    { vpsId: values.id }
                                ]
                            }
                        ]
                    }
                }
                if (values.protocol !== 'cisco') {
                    where = {
                        [Op.and]: [
                            { type: values.type },
                            { creator: 'system' },
                            {
                                [Op.or]: [
                                    { expired: true },
                                    { vpsId: null },
                                    { vpsId: values.id }
                                ]
                            }
                        ]
                    }
                }
                // Then update:
                await Server.update({
                    subject: values.subject,
                    server: values.server,
                    port: values.port,
                    type: values.type,
                    vpsId: values.id,
                    expired: false,
                    profile: values.protocol === 'cisco' ? 'cisco' : values.profile
                }, {
                    where
                })
            }

            if (values.type === 'v2ray') {
                await importV2ray(values)
            }
        },
        beforeBulkDestroy: async (vpsDesOption) => {
            const desVps = await Vps.findOne({ where: { id: vpsDesOption.where.id } })

            if (desVps) {
                const vps = await Vps.findOne({ order: sequelize.random(), where: { type: desVps.type, id: { [Op.ne]: desVps.id }, protocol: desVps.protocol, active: true, connectionLimit: desVps.connectionLimit } })

                if (vps) {
                    if (desVps.type === 'ibs') {
                        // update server
                        await Server.update({
                            subject: vps.subject,
                            server: vps.server,
                            port: vps.port,
                            type: vps.type,
                            vpsId: vps.id,
                            expired: false,
                            profile: vps.protocol === 'cisco' ? 'cisco' : vps.profile
                        }, { where: { vpsId: desVps.id, type: desVps.type, creator: 'system' } })
                    }

                    if (desVps.type === 'v2ray') {
                        //v2ray
                        const dashboard = await Dashboard.findOne({ where: { id: vps.dashboardId } })

                        if (dashboard) {
                            const servers = await Server.findAll({ where: { vpsId: desVps.id, type: desVps.type, creator: 'system' } })
                            // transter user to new xui
                            if (servers) {
                                await Promise.all(servers.map(async function (server) {
                                    const UserVpn = require('./userVpn.model')
                                    const userVpn = await UserVpn.findOne({ where: { id: server.userVpnId } })
                                    if (userVpn) {
                                        const Account = require('./account.model')
                                        const accountCount = await Account.count()
                                        const link = await xui(dashboard).addUser(userVpn, accountCount, uuidv4(), vps)

                                        if (link) {
                                            // update server
                                            await Server.update({
                                                subject: vps.subject,
                                                server: vps.server,
                                                port: vps.port,
                                                type: vps.type,
                                                vpsId: vps.id,
                                                expired: false,
                                                profile: vps.protocol === 'cisco' ? 'cisco' : vps.profile
                                            }, { where: { vpsId: desVps.id, type: desVps.type, creator: 'system' } })

                                            server.server = link
                                            await server.save()
                                        }
                                    }
                                }))
                            }
                        }
                    }
                } else {
                    // expired all servers
                    await Server.update({
                        expired: true,
                    }, { where: { vpsId: desVps.id, type: desVps.type, creator: 'system' } })
                }
            }
        },
        afterBulkUpdate: async (vpsUpdatedOption) => {
            const updatedVps = await Vps.findOne({ where: { id: vpsUpdatedOption.where.id } })

            if (updatedVps) {
                if (updatedVps.type === 'ibs') {
                    // updated current user has this vps before
                    // updated users has a removed vps and need new vps
                    await Server.update({
                        subject: updatedVps.subject,
                        server: updatedVps.server,
                        port: updatedVps.port,
                        type: updatedVps.type,
                        vpsId: updatedVps.id,
                        expired: false,
                        profile: updatedVps.protocol === 'cisco' ? 'cisco' : updatedVps.profile
                    }, {
                        where: {
                            [Op.and]: [
                                { type: updatedVps.type },
                                { creator: 'system' },
                                {
                                    [Op.or]: [
                                        { expired: true },
                                        { vpsId: null },
                                        { vpsId: updatedVps.id }
                                    ]
                                }
                            ]
                        }
                    })
                }
            }

            if (updatedVps.type === 'v2ray') {
                await importV2ray(updatedVps)
            }
        }
    }
})

module.exports = Vps