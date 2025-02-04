const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

class NowPeyments extends Model {

}

NowPeyments.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    payment_id: {
        type: DataTypes.STRING,
    },
    payment_status: {
        type: DataTypes.STRING,
    },
    pay_address: {
        type: DataTypes.STRING,
    },
    price_amount: {
        type: DataTypes.DOUBLE,
    },
    price_currency: {
        type: DataTypes.STRING,
    },
    pay_amount: {
        type: DataTypes.DOUBLE,
    },
    actually_paid: {
        type: DataTypes.DOUBLE,
    },
    pay_currency: {
        type: DataTypes.STRING,
    },
    order_id: {
        type: DataTypes.STRING,
    },
    purchase_id: {
        type: DataTypes.DOUBLE,
    },
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = NowPeyments