const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

class Voucher extends Model {
    async submit(RefID) {
        this.RefID = RefID

        await this.save()
    }
}

Voucher.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    Payer_Account: {
        type: DataTypes.STRING,
    },
    PAYMENT_AMOUNT: {
        type: DataTypes.STRING,
    },
    PAYMENT_BATCH_NUM: {
        type: DataTypes.STRING,
    }, 
    VOUCHER_NUM: {
        type: DataTypes.STRING,
    },
    VOUCHER_CODE: {
        type: DataTypes.STRING,
    },
    VOUCHER_AMOUNT: {
        type: DataTypes.STRING,
    },
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Voucher