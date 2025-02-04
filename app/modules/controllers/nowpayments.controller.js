const message = require('../../scaffold/message.scaffold')
const config = require('config')
const axios = require('axios')
const crypto = require('crypto')
const Order = require('../models/order.model')
const Product = require('../models/product.model')
const Vpn = require('../models/vpn.model')
const NowPayments = require('../models/nowpayments.model')
const UserVpn = require('../models/userVpn.model')
const Wallet = require('../models/wallet.model')
const User = require('../models/user.model')

const { myOrderReceiptHTML, vpnFinishedHTML, vpsErrHTML } = require('../../scaffold/html.scaffold')
const apiKey = config.get('nowpayments.live_api_key')
const nowpaymentsBaseURL = config.get('nowpayments.baseURL')
const osxBaseURL = config.get('osx_baseURL')

module.exports = {
    // For Admin
    readByAdmin: async function (req, res) {
        try {
            var where = req.query

            const nowPayments_all = await NowPayments.findAll({ where })

            res.scaffold.add(nowPayments_all)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    // For User
    createPaymentLink: async function (req, res) {
        try {
            const userId = req.user.id
            const productId = req.body.productId
            const userVpnId = req.body.userVpnId

            var userVpn
            const product = await Product.findOne({ where: { id: productId } })
            const wallet = await Wallet.findOne({ where: { userId } })

            if (userVpnId) {
                userVpn = await UserVpn.findOne({ where: { id: userVpnId, userId } })
            }

            if (product && wallet) {
                if (userVpn && userVpn.type !== product.type) {
                    res.scaffold.failed(message.productIsInvalid)
                } else {
                    const fixedRate = parseFloat(product.amount_dollar) * 0.0
                    const productPrice_amount_dollar = wallet.payAmount(product.amount_dollar - fixedRate)

                    if (productPrice_amount_dollar > 0) {
                        const order = await product.createOrder(userId, 'nowpayments')
                        const nowpaymentsRes = await axios.post(`${nowpaymentsBaseURL}/v1/invoice`,
                            {
                                "price_amount": productPrice_amount_dollar,
                                "price_currency": 'usd',
                                "order_id": order.id,
                                "order_description": 'Minimum fee with TRX network (Recommended)',
                                "ipn_callback_url": `${osxBaseURL}/api/v1/admin/pay/nowpayments/webhook`,
                                "success_url": `${osxBaseURL}/profile/order/successpayment`,
                                "cancel_url": `${osxBaseURL}/profile/order/failedpayment`
                            }, {
                            headers: {
                                'x-api-key': apiKey
                            }
                        })

                        const nowPaymentsBody = nowpaymentsRes.data

                        if (userVpn) {
                            await order.revival(userVpnId)
                        }

                        if (nowPaymentsBody) {
                            if (order.creator === 'admin') {
                                // Payment method:
                                // option: 1.initialize userVpn and give it to user (res.scaffold.add(userVpn))
                                const vpn = await Vpn.findVpnBy(product)

                                if (vpn) {
                                    res.scaffold.add({
                                        invoice_url: nowPaymentsBody.invoice_url,
                                        price_amount: nowPaymentsBody.price_amount,
                                        order_id: nowPaymentsBody.order_id,
                                        id: nowPaymentsBody.id
                                    })
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
                            res.scaffold.failed(message.cryptoPaymentFailed)
                        }
                    } else {
                        // wallet bigger than product price here
                        res.scaffold.failed(message.walletEnough)
                    }
                }
            } else {
                res.scaffold.failed(message.badRequest)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    callbackIPN: async function (req, res) {
        try {
            const userId = req.user.id
            const NP_id = req.query.NP_id

            const nowpaymentsRes = await axios.get(`${nowpaymentsBaseURL}/v1/payment/${NP_id}`, {
                headers: {
                    'x-api-key': apiKey
                }
            })

            const nowPaymentsBody = nowpaymentsRes.data

            if (nowPaymentsBody) {
                const order = await Order.findOne({ where: { id: nowPaymentsBody.order_id, userId } })

                if (order) {
                    const product = await Product.findOne({ where: { id: order.productId } })
                    const wallet = await Wallet.findOne({ where: { userId } })

                    if (wallet) {
                        if (order.paid) {
                            const userVpn = await UserVpn.findOne({ where: { id: order.userVpnId, userId } })

                            res.scaffold.add(userVpn)
                        } else {
                            if (nowPaymentsBody.payment_status === 'finished') {
                                await NowPayments.create({
                                    ...nowPaymentsBody,
                                    userId,
                                    orderId: order.id,
                                    payment_id: nowPaymentsBody.payment_id.toString()
                                })

                                if (product) {
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

                                            await order.submit(userVpn.id, `${NP_id}`)
                                            await wallet.updateAmount(0)
                                            await req.user.payReferrerBonus(order.amount_dollar)

                                            myOrderReceiptHTML(req.user, order)

                                            res.scaffold.add(userVpn)
                                        } else {
                                            await wallet.updateAmount(nowPaymentsBody.pay_amount.toFixed(2) + wallet.amount_dollar)

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
                                            await wallet.updateAmount(0)
                                            await req.user.payReferrerBonus(order.amount_dollar)

                                            myOrderReceiptHTML(req.user, order)

                                            res.scaffold.add(userVpn)
                                        } else {
                                            await wallet.updateAmount(nowPaymentsBody.pay_amount.toFixed(2) + wallet.amount_dollar)

                                            vpsErrHTML(req.user)

                                            res.scaffold.failed(message.badVps)
                                        }
                                    }
                                } else {
                                    await wallet.updateAmount(0)
                                    await req.user.payReferrerBonus(order.amount_dollar)

                                    res.scaffold.failed(message.notFound)
                                }
                            } else {
                                res.scaffold.failed(message.cryptoPaymentFailed)
                            }
                        }
                    } else {
                        res.scaffold.failed(message.notFound)
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
    // For Common
    webhookIPN: async function (req, res) {
        try {
            var productId
            var userId
            const nowPaymentsBody = req.body
            const NP_id = nowPaymentsBody.payment_id

            if (nowPaymentsBody) {
                const notificationsKey = config.get('nowpayments.live_ipn')
                const hmac = crypto.createHmac('sha512', notificationsKey)
                hmac.update(JSON.stringify(nowPaymentsBody, Object.keys(nowPaymentsBody).sort()))
                const signature = hmac.digest('hex')
                const headerSignature = req.headers['x-nowpayments-sig']

                if (headerSignature && signature === headerSignature) {
                    if (nowPaymentsBody.payment_status === 'finished') {
                        const order = await Order.findOne({ where: { id: nowPaymentsBody.order_id } })

                        if (order) {
                            userId = order.userId
                            productId = order.productId

                            const product = await Product.findOne({ where: { id: productId } })
                            const user = await User.findOne({ where: { id: userId } })
                            const wallet = await Wallet.findOne({ where: { userId } })

                            await NowPayments.create({
                                ...nowPaymentsBody,
                                userId,
                                orderId: nowPaymentsBody.order_id,
                                payment_id: nowPaymentsBody.payment_id.toString()
                            })

                            if (product && wallet && user) {
                                if (order.creator === 'admin') {
                                    // give account to user
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

                                        await order.submit(userVpn.id, `${NP_id}`)
                                        await wallet.updateAmount(0)
                                        await user.payReferrerBonus(order.amount_dollar)

                                        myOrderReceiptHTML(user, order)
                                    } else {
                                        await wallet.updateAmount(nowPaymentsBody.pay_amount.toFixed(2) + wallet.amount_dollar)

                                        vpnFinishedHTML(user)
                                    }
                                } else {
                                    // option: 2.use api to initialize userVpn from real server
                                    var userVpn

                                    if (order.type === 'create') {
                                        userVpn = await product.createUserVpn(userId, user)
                                    } else {
                                        // update userVpn *
                                        const oldUserVpn = await UserVpn.findOne({ where: { id: order.userVpnId } })

                                        if (oldUserVpn) {
                                            userVpn = await product.updateUserVpn(oldUserVpn, user)
                                        }
                                    }

                                    if (userVpn) {
                                        await order.submit(userVpn.id, `${NP_id}`)
                                        await wallet.updateAmount(0)
                                        await user.payReferrerBonus(order.amount_dollar)

                                        myOrderReceiptHTML(user, order)
                                    } else {
                                        await wallet.updateAmount(nowPaymentsBody.pay_amount.toFixed(2) + wallet.amount_dollar)

                                        vpsErrHTML(user)
                                    }
                                }
                            } else {
                                await wallet.updateAmount(0)
                                await user.payReferrerBonus(order.amount_dollar)
                            }
                        }
                    }
                }
            }

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}