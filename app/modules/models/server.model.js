const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

class Server extends Model {

}

Server.init({
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
    expired: {
        type: DataTypes.BOOLEAN,
        allowNullL: false,
        defaultValue: false
    },
    creator: {
        type: Sequelize.ENUM('admin', 'system'),
        allowNull: false,
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Server