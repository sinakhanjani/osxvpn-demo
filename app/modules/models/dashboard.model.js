const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

// SECOND PLAN 
class Dashboard extends Model {

}

Dashboard.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    dashboardURL: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    key: {
        type: DataTypes.STRING(2048),
        allowNull: false,
    },
    dashboardUsername: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dashboardPassword: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Dashboard