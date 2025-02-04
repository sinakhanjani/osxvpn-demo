const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

// SECOND PLAN 
class Discount extends Model {
    async submit(userVpnId, receipt) {
        try {
            this.paid = true
            this.userVpnId = userVpnId
            this.receipt = receipt

            await this.save()
        } catch (e) {
            throw new Error(e)
        }
    }
}

Discount.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
        defaultValue: false,
        allowNull: false,
    },
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Discount