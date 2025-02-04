const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

// SECOND PLAN 
class PerfectMoney extends Model {
    async submit() {
        this.finished = true
        await this.save()
    }

    async deny(remainAmount) {
        this.finished = false
        this.remainAmount = remainAmount

        await this.save()
    }
}

PerfectMoney.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    VOUCHER_NUM: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    VOUCHER_AMOUNT: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    remainAmount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    finished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    Payee_Account: {
        type: DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
    },
    PAYMENT_BATCH_NUM: {
        type: DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
    },
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = PerfectMoney