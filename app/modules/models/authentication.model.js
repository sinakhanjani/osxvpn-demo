const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')
const User = require('./user.model')

// SECOND PLAN 
class Authentication extends Model {
    static get randomCode() {
        const min = 100000
        const max = 999999
        const digit = Math.floor(Math.random() * (max - min + 1)) + min

        return String(digit)
    }
}

Authentication.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            customValidator(value) {
                const isEmail = validator.isEmail(value)
                if (!isEmail) {
                    throw new Error("Please enter the valid email address");
                }
            }
        }
    },
    expired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    attempt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
})

module.exports = Authentication