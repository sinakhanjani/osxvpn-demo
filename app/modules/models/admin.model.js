const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const config = require('config')
const env = config.get('env')

class Admin extends Model {
    generateAuthToken() {
        return jwt.sign({ _id: this.id.toString() }, env.JWT_SECRET_ADMIN, { expiresIn: '90d' })
    }
}

Admin.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            customValidator(value) {
                const isEmail = validator.isEmail(value)
                if (!isEmail) {
                    throw new Error("Please enter the valid email address");
                }
            }
        },
        get() {
            const value = this.getDataValue('email')
            return value.toLowerCase()
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tokens: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: (admin) => {
            const jwtToken = admin.generateAuthToken()
            
            admin.tokens = jwtToken
        },
    }
})

module.exports = Admin