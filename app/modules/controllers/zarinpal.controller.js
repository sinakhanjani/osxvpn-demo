const Order = require('../models/order.model')
const Product = require('../models/product.model')
const Vpn = require('../models/vpn.model')
const message = require('../../scaffold/message.scaffold')
const axios = require('axios')
const config = require('config')
const jsdom = require("jsdom")
const PerfectMoney = require('../models/perfectmoney.model')
const Wallet = require('..//models/wallet.model')
const Zarinp = require('../models/zarinp.model')
const UserVpn = require('../models/userVpn.model')
const { myOrderReceiptHTML, vpnFinishedHTML } = require('../../scaffold/html.scaffold')
const ZarinpalCheckout = require('zarinpal-checkout')

const merchantID = config.get('zarinpal.merchantID')
const sandbox = config.get('zarinpal.sandbox')
const osxBaseURL = config.get('osx_baseURL')

const zarinpal = ZarinpalCheckout.create(merchantID, sandbox)

module.exports = {
    // For admin
    readByAdmin: async function (req, res) {
        try {
            const where = req.query

            const zarinpals = await Zarinp.findAll({ where })

            res.scaffold.add(zarinpals)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    // For User
    create: async function (req, res) {
        try {
            const productId = req.params.productId
            const userId = req.user.id
            const userVpnId = req.body.userVpnId

            var userVpn
            const product = await Product.findOne({ where: { id: productId } })
            const vpn = await Vpn.findVpnBy(product)

            if (userVpnId) {
                userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId } })
            }

            if (product) {
                if (userVpn && userVpn.type !== product.type) {
                    res.scaffold.failed(message.productIsInvalid)
                } else {
                    const zarinpalBody = await zarinpal.PaymentRequest({
                        Amount: product.amount_rial / 10,
                        Description: `${product.subject}`,
                        CallbackURL: `${osxBaseURL}/user/payment/success?productId=${productId}&userId=${userId}`,
                    })

                    if (zarinpalBody.status === 100) {
                        const order = await product.createOrder(userId, 'zarinpal')

                        await Zarinp.create({
                            orderId: order.id,
                            userId,
                            authority: zarinpalBody.authority,
                            url: zarinpalBody.url
                        })

                        if (userVpn) {
                            await order.revival(userVpnId)
                        }

                        if (order.creator === 'admin') {
                            if (vpn) {
                                // give a account to user
                                // option: 1.initialize userVpn and give it to user (res.scaffold.add(userVpn))
                                // create zarinap
                                res.scaffold.add({ url: zarinpalBody.url })
                            } else {
                                vpnFinishedHTML(req.user)

                                res.scaffold.failed(message.vpnFinished)
                            }
                        } else {
                            // option: 2.use api to initialize userVpn from real server
                            res.scaffold.add({
                                invoice_url: nowPaymentsBody.invoice_url,
                                price_amount: nowPaymentsBody.price_amount,
                                order_id: nowPaymentsBody.order_id,
                                id: nowPaymentsBody.id
                            })
                        }
                    } else {
                        res.scaffold.failed(message.badRequest)
                    }
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    verification: async function (req, res) {
        try {
            const authority = req.query.authority
            const userId = req.user.id
            const productId = req.query.productId

            const zarinp = await Zarinp.findOne({ where: { authority, userId }, include: [{ model: Order, as: 'order' }] })

            if (zarinp && zarinp.order) {
                const zarinpalBody = await zarinpal.PaymentVerification({
                    Amount: zarinp.order.amount_rial / 10, // In Tomans
                    Authority: authority,
                })

                if (zarinpalBody) {
                    if (zarinpalBody.status !== 100) {
                        if (zarinpalBody.status === 101) {
                            const order = await Order.findOne({ where: { id: zarinp.order.id, userId } })
                            const userVpn = await UserVpn.findOne({ where: { id: order.userVpnId } })

                            res.scaffold.add(userVpn)
                        } else {
                            res.scaffold.failed(message.zarinpalPaymentFailed)
                        }
                    } else {
                        const order = await Order.findOne({ where: { id: zarinp.order.id, userId } })
                        const product = await Product.findOne({ where: { id: productId } })

                        if (order && product) {
                            if (order.creator === 'admin') {
                                // give a account to user
                                // option: 1.initialize userVpn and give it to user (res.scaffold.add(userVpn))
                                const vpn = await Vpn.findVpnBy(product)
                                // check vpn is available in database for sell or not
                                if (vpn) {
                                    var userVpn

                                    if (order.type === 'create') {
                                        userVpn = await vpn.createUserVpn(userId)
                                    } else {
                                        // update *
                                    }

                                    await order.submit(userVpn.id, `${zarinpalBody.RefID}`)
                                    await req.user.payReferrerBonus(product.amount_dollar)
                                    await zarinp.submit(zarinpalBody.RefID)

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
                                    userVpn = await product.createUserVpn(userId, req.user)
                                } else {
                                    // update userVpn *
                                    const oldUserVpn = await UserVpn.findOne({ where: { id: order.userVpnId } })

                                    if (oldUserVpn) {
                                        userVpn = await product.updateUserVpn(oldUserVpn, req.user)
                                    }
                                }

                                if (userVpn) {
                                    await order.submit(userVpn.id, `${NP_id}`)

                                    myOrderReceiptHTML(req.user, order)

                                    res.scaffold.add(userVpn)
                                } else {
                                    vpsErrHTML(req.user)

                                    res.scaffold.failed(message.badVps)
                                }
                            }
                        } else {
                            res.scaffold.failed(message.notFound)
                        }
                    }
                } else {
                    res.scaffold.failed(message.notFound)
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}