const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')

class Zarinp extends Model {
    async submit(RefID) {
        this.RefID = RefID

        await this.save()
    }
}

Zarinp.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    authority: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    RefID: {
        type: DataTypes.INTEGER,
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Zarinp