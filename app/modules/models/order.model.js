const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

// SECOND PLAN 
class Order extends Model {
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

    async revival(userVpnId) {
        this.userVpnId = userVpnId
        this.type = 'revival'

        await this.save()
    }
}

Order.init({
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
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    receipt: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    paymentMethod: {
        type: Sequelize.ENUM('zarinpal', 'perfectmoney', 'plisio', 'card', 'nowpayments', 'wallet'),
        allowNull: false,
    },
    type: {
        type: Sequelize.ENUM('create', 'revival'),
        allowNull: false,
        defaultValue: 'create'
    },
    hasDiscount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    creator: {
        type: Sequelize.ENUM('admin', 'system'),
        allowNull: false,
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Order