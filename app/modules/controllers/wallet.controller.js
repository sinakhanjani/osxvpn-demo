const message = require('../../scaffold/message.scaffold')
const config = require('config')
const axios = require('axios')
const User = require('../models/user.model')
const Order = require('../models/order.model')
const Product = require('../models/product.model')
const Vpn = require('../models/vpn.model')
const UserVpn = require('../models/userVpn.model')
const Wallet = require('../models/wallet.model')
const Charge = require('../models/charge.model')

const { myOrderReceiptHTML, vpnFinishedHTML, vpsErrHTML } = require('../../scaffold/html.scaffold')

module.exports = {
    // For Admin
    charge: async function (req, res) {
        try {
            const userId = req.params.userId
            const amount = req.body.amount

            const user = await User.findOne({ where: { id: userId } })

            if (user) {
                const wallet = await Wallet.findOne({ where: { userId } })

                if (wallet) {
                    await Wallet.update({ amount_dollar: amount + wallet.amount_dollar }, { where: { userId: userId } })
                    await Charge.create({
                        amount_rial: 0,
                        amount_dollar: amount,
                        userId,
                        walletId: wallet.id,
                        adminId: req.user.id
                    })

                    res.scaffold.success(message.success)
                } else {
                    res.scaffold.failed(message.notFound)
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
    // use this req when res: wallet bigger than product price here , code: 610
    payByWallet: async function (req, res) {
        try {
            const productId = req.body.productId
            const userVpnId = req.body.userVpnId
            const userId = req.user.id
            const unitPerGB = req.body.unitPerGB ?? 1

            var oldUserVpn
            const product = await Product.findOne({ where: { id: productId } })
            const wallet = await Wallet.findOne({ where: { userId } })

            if (userVpnId) {
                oldUserVpn = await UserVpn.findOne({ where: { id: userVpnId } })
            }

            if (product && wallet) {
                if (oldUserVpn && oldUserVpn.type !== product.type) {
                    res.scaffold.failed(message.productIsInvalid)
                } else {
                    const fixedRate = parseFloat(product.amount_dollar * unitPerGB) * 0.0
                    const product_fixed_ratedPrice_dollar = (product.amount_dollar * unitPerGB) - fixedRate
                    const productPrice_amount_dollar = wallet.payAmount(product_fixed_ratedPrice_dollar)

                    if (productPrice_amount_dollar === 0) {
                        const wallet_amount_dollar = wallet.amount_dollar
                        const finished_wallet_amount_dollar = wallet_amount_dollar - product_fixed_ratedPrice_dollar

                        const order = await product.createOrder(userId, 'wallet')

                        if (oldUserVpn) {
                            await order.revival(userVpnId)
                        }

                        if (order.creator === 'admin') {
                            // Payment method:
                            // option: 1.initialize userVpn and give it to user (res.scaffold.add(userVpn))
                            const vpn = await Vpn.findVpnBy(product)

                            if (vpn) {
                                var userVpn

                                if (order.type === 'create') {
                                    userVpn = await vpn.createUserVpn(userId)
                                } else {
                                    // update *
                                }

                                await order.submit(userVpn.id, `wlt-${order.id}`)
                                await wallet.updateAmount(finished_wallet_amount_dollar)
                                await req.user.payReferrerBonus(product.amount_dollar)

                                myOrderReceiptHTML(req.user, order)

                                res.scaffold.add(userVpn)
                            } else {
                                vpnFinishedHTML(req.user)

                                res.scaffold.failed(message.vpnFinished)
                            }
                        } else {
                            // option: 2.use api to initialize userVpn from real server
                            var userVpn

                            if (order.type === 'create') {
                                userVpn = await product.createUserVpn(userId, req.user, unitPerGB)
                            } else {
                                // update userVpn *
                                if (oldUserVpn) {
                                    userVpn = await product.updateUserVpn(oldUserVpn, req.user, unitPerGB)
                                }
                            }

                            if (userVpn) {
                                await order.submit(userVpn.id, `wlt-${order.id}`)
                                await wallet.updateAmount(finished_wallet_amount_dollar)
                                await req.user.payReferrerBonus(product.amount_dollar * unitPerGB)

                                myOrderReceiptHTML(req.user, order)

                                res.scaffold.add(userVpn)
                            } else {
                                vpsErrHTML(req.user)

                                res.scaffold.failed(message.badVps)
                            }
                        }
                    } else {
                        res.scaffold.failed(message.badRequest)
                    }
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            console.log(e)
            res.scaffold.eFailed(e)
        }
    },
}