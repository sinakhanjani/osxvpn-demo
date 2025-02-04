const Order = require('../models/order.model')
const Product = require('../models/product.model')
const Vpn = require('../models/vpn.model')
const message = require('../../scaffold/message.scaffold')
const axios = require('axios')
const config = require('config')
const jsdom = require("jsdom")
const PerfectMoney = require('../models/perfectmoney.model')
const Wallet = require('..//models/wallet.model')
const Voucher = require('../models/voucher.model')
const { myOrderReceiptHTML, vpnFinishedHTML, vpsErrHTML } = require('../../scaffold/html.scaffold')
const sendEMail = require('../../helper/nodemailer.helper')
const UserVpn = require('../models/userVpn.model')

module.exports = {
    // For Admin
    readByAdmin: async function (req, res) {
        try {
            var where = req.query

            const perfectMoneys = await PerfectMoney.findAll({ where })

            res.scaffold.add(perfectMoneys)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    // create voucher
    create: async function (req, res) {
        try {
            const AccountID = config.get('perfectMoney.AccountID')
            const PassPhrase = config.get('perfectMoney.PassPhrase')
            const Payer_Account = config.get('perfectMoney.Payer_Account')

            const perfectMoneyRes = await axios.get('https://perfectmoney.com/acct/ev_create.asp', {
                params: {
                    AccountID,
                    PassPhrase,
                    Payer_Account,
                    Amount: req.body.amount
                }
            })

            if (perfectMoneyRes.data) {
                var object = {}
                const dom = new jsdom.JSDOM(perfectMoneyRes.data)
                const paragraphs = dom.window.document.querySelectorAll('input')

                paragraphs.forEach((paragraph) => {
                    object[paragraph.name] = paragraph.value
                })
                console.log(object)
                sendEMail(`<h1>VOUCHER_NUM:${object.VOUCHER_NUM}, VOUCHER_CODE:${object.VOUCHER_CODE}<h1>`, 'Voucher Created', 'ipersianvpn@gmail.com')

                const voucher = await Voucher.create({
                    ...object,
                    adminId: req.user.id
                })

                res.scaffold.add(voucher)
            } else {
                res.scaffold.failed(message.badRequest)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    balance: async function (req, res) {
        try {
            const AccountID = config.get('perfectMoney.AccountID')
            const PassPhrase = config.get('perfectMoney.PassPhrase')

            const perfectMoneyRes = await axios.get('https://perfectmoney.com/acct/balance.asp', {
                params: {
                    AccountID,
                    PassPhrase,
                }
            })

            if (perfectMoneyRes.data) {
                var object = {}
                const dom = new jsdom.JSDOM(perfectMoneyRes.data)
                const paragraphs = dom.window.document.querySelectorAll('input')

                paragraphs.forEach((paragraph) => {
                    object[paragraph.name] = paragraph.value
                })

                res.scaffold.add(object)
            } else {
                res.scaffold.failed(message.badRequest)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    // active voucher
    active: async function (req, res) {
        try {
            const id = req.params.productId
            const ev_number = req.body.ev_number
            const ev_code = req.body.ev_code
            const userVpnId = req.body.userVpnId
            const userId = req.user.id
            const AccountID = config.get('perfectMoney.AccountID')
            const PassPhrase = config.get('perfectMoney.PassPhrase')
            const Payer_Account = config.get('perfectMoney.Payer_Account')

            var oldUserVpn
            const product = await Product.findOne({ where: { id } })
            const wallet = await Wallet.findOne({ where: { userId } })

            if (userVpnId) {
                oldUserVpn = await UserVpn.findOne({ where: { id: userVpnId, userId } })
            }

            const fixedRate = product.amount_dollar * 0.0
            const productPrice_amount_dollar = wallet.payAmount(product.amount_dollar - fixedRate)

            if (product) {
                if (oldUserVpn && oldUserVpn.type !== product.type) {
                    res.scaffold.failed(message.productIsInvalid)
                } else {
                    if (productPrice_amount_dollar > 0) {
                        const perfectMoneyRes = await axios.get('https://perfectmoney.com/acct/ev_activate.asp', {
                            params: {
                                AccountID,
                                PassPhrase,
                                Payee_Account: Payer_Account,
                                ev_number,
                                ev_code
                            }
                        })

                        if (perfectMoneyRes.data) {
                            console.log(perfectMoneyRes.data);
                            if (product) {
                                var object = {}
                                const dom = new jsdom.JSDOM(perfectMoneyRes.data)
                                const paragraphs = dom.window.document.querySelectorAll('input')

                                paragraphs.forEach((paragraph) => {
                                    object[paragraph.name] = paragraph.value
                                })

                                const PAYMENT_BATCH_NUM = object.PAYMENT_BATCH_NUM

                                const order = await product.createOrder(userId, 'perfectmoney')

                                if (oldUserVpn) {
                                    await order.revival(userVpnId)
                                }

                                if (PAYMENT_BATCH_NUM) {
                                    const perfectMoney = await PerfectMoney.create({
                                        VOUCHER_NUM: `${object.VOUCHER_NUM}`,
                                        VOUCHER_AMOUNT: parseFloat(object.VOUCHER_AMOUNT),
                                        Payee_Account: `${object.Payee_Account}`,
                                        PAYMENT_BATCH_NUM: `${PAYMENT_BATCH_NUM}`,
                                        userId,
                                        orderId: order.id
                                    })

                                    if (parseFloat(object.VOUCHER_AMOUNT) >= productPrice_amount_dollar) {
                                        const remainAmount_dollar = parseFloat(object.VOUCHER_AMOUNT) - productPrice_amount_dollar

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

                                                await order.submit(userVpn.id, `${PAYMENT_BATCH_NUM}`)
                                                await perfectMoney.submit()
                                                await wallet.updateAmount(remainAmount_dollar + wallet.amount_dollar)
                                                await req.user.payReferrerBonus(product.amount_dollar)

                                                myOrderReceiptHTML(req.user, order)

                                                res.scaffold.add(userVpn)
                                            } else {
                                                await wallet.updateAmount(parseFloat(object.VOUCHER_AMOUNT) + wallet.amount_dollar)

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
                                                if (oldUserVpn) {
                                                    userVpn = await product.updateUserVpn(oldUserVpn, req.user)
                                                }
                                            }

                                            if (userVpn) {
                                                await order.submit(userVpn.id, `${PAYMENT_BATCH_NUM}`)
                                                await perfectMoney.submit()
                                                await wallet.updateAmount(remainAmount_dollar + wallet.amount_dollar)
                                                await req.user.payReferrerBonus(product.amount_dollar)

                                                myOrderReceiptHTML(req.user, order)

                                                res.scaffold.add(userVpn)
                                            } else {
                                                await wallet.updateAmount(parseFloat(object.VOUCHER_AMOUNT) + wallet.amount_dollar)

                                                vpsErrHTML(req.user)

                                                res.scaffold.failed(message.badVps)
                                            }
                                        }
                                    } else {
                                        const remainAmount_dollar = productPrice_amount_dollar - parseFloat(object.VOUCHER_AMOUNT)

                                        const wallet = await Wallet.findOne({ where: { userId } })

                                        if (wallet) {
                                            await perfectMoney.deny(remainAmount_dollar)
                                            await wallet.updateAmount(parseFloat(object.VOUCHER_AMOUNT) + wallet.amount_dollar)
                                        }

                                        res.scaffold.failed(message.remainAmount(remainAmount_dollar))
                                    }
                                } else {
                                    res.scaffold.failed(message.invalidPAYMENT_BATCH_NUM)
                                }
                            } else {
                                res.scaffold.failed(message.notFound)
                            }
                        } else {
                            res.scaffold.failed(message.badRequest)
                        }
                    } else {
                        // wallet amount is bigger than product amount code 610
                        res.scaffold.failed(message.walletEnough)
                    }
                }
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}
