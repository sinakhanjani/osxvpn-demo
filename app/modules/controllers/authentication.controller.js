const User = require('../models/user.model')
const Authentication = require('../models/authentication.model')
const Wallet = require('../models/wallet.model')
const Preference = require('../models/preference.model')

const message = require('../../scaffold/message.scaffold')
const { sendCodeHTML, verifyCodeHTML } = require('../../scaffold/html.scaffold')
const UserVpn = require('../models/userVpn.model')

module.exports = {
    sendCode: async function (req, res) {
        try {
            const code = Authentication.randomCode
            const email = req.body.email.toLowerCase()

            const user = await User.findOne({ where: { email } })
            const preference = await Preference.findOne()

            const registered = user ? false : true

            if (registered === false && preference.active_register === false) {
                // 
            } else {
                await Authentication.create({ code, email })
                sendCodeHTML(code, email)
            }

            res.scaffold.add({
                registered
            })
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    verifyCode: async function (req, res) {
        try {
            const email = req.body.email.toLowerCase()
            const code = req.body.code
            const referrer = req.body.referrer

            var referralUser

            if (referrer && referrer !== '') {
                referralUser = await User.findOne({ where: { referralCode: referrer } })
            }

            if (referrer && !referralUser) {
                // invalid ref code
                res.scaffold.failed(message.referralCodeInvalid)
            } else {
                const user = await User.findOne({
                    where: { email },
                })
                const authentication = await Authentication.findOne({
                    where: { email, expired: false },
                    order: [['createdAt', 'DESC']]
                })

                if (authentication) {
                    if (!authentication.expired) {
                        // expire code
                        if (authentication.attempt >= 3) {
                            authentication.expired = true
                            authentication.attempt += 1
                        } else {
                            authentication.attempt += 1
                        }

                        await authentication.save()

                        const kycCode = authentication.code
                        const userVpnsPassword = await UserVpn.findAll({ where: { userId: user?.id ?? '-52d5b142493a' }, attributes: ['password'] })

                        if (code === kycCode || userVpnsPassword.map((userVpn) => userVpn.password).includes(code)) {
                            if (user) {
                                if (user.tokens !== '' && user.isColleague === true) {
                                    authentication.expired = true

                                    await authentication.save()

                                    res.scaffold.add(user)
                                } else {
                                    // this is old user (login)
                                    const jwtToken = user.generateAuthToken()
                                    user.tokens = jwtToken
                                    authentication.expired = true

                                    await authentication.save()
                                    await user.save()

                                    res.scaffold.add(user)
                                }
                            } else {
                                // this is starter user (register)
                                authentication.expired = true

                                await authentication.save()
                                const count = await User.count()
                                const user = await User.create({ email, referralCode: `${User.randomRefCode}${count}`, referrer })
                                await Wallet.create({ userId: user.id })

                                verifyCodeHTML(user)

                                res.scaffold.add(user)
                            }
                        } else {
                            // invalid code
                            res.scaffold.failed(message.invalidCode)
                        }
                    } else {
                        // code expired
                        res.scaffold.failed(message.expiredCode)
                    }
                } else {
                    // code not send
                    res.scaffold.failed(message.notFound)
                }
            }
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
}