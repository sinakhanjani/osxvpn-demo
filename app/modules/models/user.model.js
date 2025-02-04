const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("postgres::memory:");
const validator = require('validator')
const sequelize = require('../../db/sequelize')
const jwt = require('jsonwebtoken');
const UserVpn = require("./userVpn.model");
const Authentication = require('./authentication.model')
const Order = require('./order.model')
const Wallet = require('./wallet.model')
const config = require('config')
const { referrerBonusHTML } = require('../../scaffold/html.scaffold')
require('dotenv').config()

const env = config.get('env')

const referrerBonus = config.get('referral.bonus_amount_percent')

class User extends Model {
    generateAuthToken() {
        return jwt.sign({ _id: this.id.toString() }, env.JWT_SECRET_USER, { expiresIn: '364d' })
    }

    static get randomRefCode() {
        const min = 10000
        const max = 99999
        const digit = Math.floor(Math.random() * (max - min + 1)) + min

        return String(digit)
    }

    async payReferrerBonus(amount_dollar) {
        if (this.referrer) {
            const referralUser = await User.findOne({ where: { referralCode: this.referrer } })

            if (referralUser) {
                const referralWallet = await Wallet.findOne({ where: { userId: referralUser.id } })

                if (referralWallet) {
                    await referralWallet.updateAmount(referralWallet.amount_dollar + (amount_dollar * referrerBonus))

                    referrerBonusHTML(this, referralUser, (amount_dollar * referrerBonus))
                }
            }
        }
    }
}

User.init({
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
                    throw new Error('لطفا یک ایمیل صحیح وارد کنید');
                }
            }
        }
    },
    referralCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    referrer: {
        type: DataTypes.STRING,
    },
    tokens: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    isColleague: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: (user) => {
            const jwtToken = user.generateAuthToken()

            user.tokens = jwtToken
        },
        beforeBulkDestroy: async (user) => {
            const userId = user.where.id

            await UserVpn.destroy({
                where:
                    { userId }
            })
            await Order.destroy({
                where:
                    { userId }
            })
            await Wallet.destroy({
                where:
                    { userId }
            })
            await Authentication.destroy({
                where:
                    { userId }
            })
        }
    }
})

module.exports = User