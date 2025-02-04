const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

// SECOND PLAN 
class Wallet extends Model {
    get amount_rial() {
        const usdtRialPrice = 1

        return parseInt(this.amount_dollar * usdtRialPrice)
    }

    async updateAmount(amount_dollar) {
        this.amount_dollar = amount_dollar.toFixed(2)

        await this.save()
    }

    payAmount(productPrice) {
        const amount = productPrice - this.amount_dollar

        if (amount > 0) {
            return amount
        }
        if (amount === 0) {
            return 0
        }
        if (amount < 0) {
            return 0
        }
    }
}

Wallet.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    amount_dollar: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeBulkUpdate: (wallets) => {
            wallets.attributes.amount_dollar = wallets.attributes.amount_dollar.toFixed(2)
        }
    }
})

module.exports = Wallet