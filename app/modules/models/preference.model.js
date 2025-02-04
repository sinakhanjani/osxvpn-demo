const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

// SECOND PLAN 
class Preference extends Model {

}

Preference.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    active_perfectMoney: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    active_nowPayments: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    active_zarinp: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    active_osx: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    active_soldout: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    active_register: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    active_chat: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    active_content: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    content_description: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Preference