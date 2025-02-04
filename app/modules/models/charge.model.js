const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const sequelize = require('../../db/sequelize')

// SECOND PLAN 
class Charge extends Model {
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

Charge.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    amount_rial: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    amount_dollar: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Charge