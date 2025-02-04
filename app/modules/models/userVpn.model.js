const { Sequelize, Op, Model, DataTypes } = require("sequelize")
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const Account = require('./account.model')
const Server = require('./server.model')
const Charge = require('./charge.model')

class UserVpn extends Model {
    get trafficInMb() {
        switch (this.traffic) {
            case '1gb': return 1000
            case '12gb': return 12000
            case '24gb': return 24000
            case '48gb': return 48000
            case '100gb': return 100000
            case '200gb': return 200000
            case '400gb': return 400000
            case 'unlimited': return 1000000
            default: return 1
        }
    }

    get trafficInKB() {
        switch (this.traffic) {
            case '1gb': return '100000000'
            case '12gb': return '1200000000'
            case '24gb': return '2400000000'
            case '48gb': return '4800000000'
            case '100gb': return '10000000000'
            case '200gb': return '20000000000'
            case '400gb': return '40000000000'
            case 'unlimited': return '100000000000'
            default: return 1
        }
    }
}

UserVpn.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    creator: {
        type: Sequelize.ENUM('admin', 'system'),
        allowNull: false,
    },
    ibsTable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    note: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
    },
    isLock: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeBulkDestroy: async (userVpn) => {
            if (userVpn.where.id) {
                await Account.destroy({ where: { userVpnId: userVpn.where.id } })
                await Server.destroy({ where: { userVpnId: userVpn.where.id } })
                await Charge.destroy({ where: { userVpnId: userVpn.where.id } })
            }

            if (userVpn.where.userId) {
                await Account.destroy({ where: { userId: userVpn.where.userId } })
                await Server.destroy({ where: { userId: userVpn.where.userId } })
                await Charge.destroy({ where: { userId: userVpn.where.userId } })
            }
        }
    }
})

module.exports = UserVpn