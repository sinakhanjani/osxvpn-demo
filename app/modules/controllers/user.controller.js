const message = require('../../scaffold/message.scaffold')
const User = require('../models/user.model')
const UserVpn = require('../models/userVpn.model')
const Wallet = require('../models/wallet.model')
const Server = require('../models/server.model')
const Account = require('../models/account.model')
const sendEMail = require('../../helper/nodemailer.helper')
const { Op } = require("sequelize");

module.exports = {
    // MARK: - For admin
    readByAdmin: async function (req, res) {
        try {
            var where = req.query

            if (req.query.email) {
                where = {
                    ...where,
                    email: {
                        [Op.like]: '%' + req.query.email + '%'
                    }
                }
            }

            const users = await User.findAll(
                {
                    where,
                    // include: [
                    //     {
                    //         model: UserVpn,
                    //         as: 'userVpns',
                    //         include: [
                    //             {
                    //                 model: Server,
                    //                 as: 'servers',
                    //             },
                    //             {
                    //                 model: Account,
                    //                 as: 'accounts',
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         model: Wallet,
                    //         as: 'wallet',
                    //         attributes: ['amount_dollar']
                    //     }
                    // ],
                    order: [
                        ['createdAt', 'DESC'],
                        // [{ model: UserVpn, as: 'userVpns' }, 'createdAt', 'ASC']
                    ],
                    attributes: ['email', 'id']
                })

            res.scaffold.add(users)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    readOneByAdmin: async function (req, res) {
        try {
            var where = req.query

            if (req.query.email) {
                where = {
                    ...where,
                    email: {
                        [Op.like]: '%' + req.query.email + '%'
                    }
                }
            }

            const user = await User.findOne(
                {
                    where,
                    include: [
                        {
                            model: UserVpn,
                            as: 'userVpns',
                            include: [
                                {
                                    model: Server,
                                    as: 'servers',
                                },
                                {
                                    model: Account,
                                    as: 'accounts',
                                }
                            ]
                        },
                        {
                            model: Wallet,
                            as: 'wallet',
                            attributes: ['amount_dollar']
                        }
                    ],
                    order: [
                        ['createdAt', 'DESC'],
                        [{ model: UserVpn, as: 'userVpns' }, 'createdAt', 'ASC']
                    ],
                })

            if (user) {
                res.scaffold.add(user)
            } else {
                res.scaffold.add(user)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    delete: async function (req, res) {
        try {
            // delete user for admin
            const id = req.params.id

            await User.destroy({ where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            console.log(e)
            res.scaffold.eFailed(e)
        }
    },
    create: async function (req, res) {
        try {
            // create user for admin
            const email = req.body.email.toLowerCase()
            const referrer = req.body.referrer

            const count = await User.count()
            const user = await User.create({ email, referrer, referralCode: `${User.randomRefCode}${count}` })
            await Wallet.create({ userId: user.id })

            res.scaffold.add(user)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    sendEmail: async function (req, res) {
        try {
            var where = {}
            if (req.body.userId) {
                where = {
                    id: req.body.userId
                }
            }
            const subject = req.body.subject
            const body = req.body.body

            const users = await User.findAll({
                where,
                attributes: ['email']
            })

            if (users) {
                const emails = users.map((user) => (user.email))

                emails.forEach((email) => {
                    sendEMail(body, subject, email)
                })

                res.scaffold.add({
                    emails: emails
                })
            } else {
                res.scaffold.add(user)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    vpsChanGToAll: async function (req, res) {
        try {
            const users = await User.findAll({
                attributes: ['email']
            })

            if (users) {
                const emails = users.map((user) => (user.email))

                await Promise.all(users.map(async function (user) {
                    await sendEMail(`
                    <!DOCTYPE html>
                    <html>
                    
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>OSX VPN</title>
                    </head>
                    
                    <body style="font-family: arial; padding: 16px;">
                        <section>
                            <div style="align-items: left; text-align: left; flex-grow: 100;">
                                <h3>آدرس های اتصال را تغییر دهید</h3>
                                <h4>با سلام خدمت دوستان عزیز</h4>
                                <p>جهت اتصال مجدد لطفا از طریق سایت persianosx.top وارد پنل کاربری خود شوید و از قسمت پروفایل من آدرس سرورهای جدید را جایگزین آدرس سرور‌های قبلی کنید.</p>
                                <p> میتوانید مشکلات خود را از طریق چت آنلاین سایت نیز مطرح کنید</p>
                                <p>موفق باشید</p>
                                <p>این پیام به صورت خودکار ارسال شده است، لطفا به آن پاسخ ندهید</p>
                            </div>
                        </section>
                        <footer>
                            <h4 style="color:#2C5F84">OSX Team</h4>
                            <p>OSX Services | Virtual Private Network</p>
                        </footer>
                    </body>
                    
                    </html>
                    `, 'تغییرآدرس های اتصال به سرور', user.email)
                }))

                res.scaffold.add({
                    emails: emails
                })
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    // MARK: - For users
    me: async function (req, res) {
        try {
            res.scaffold.add(req.user)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    logout: async function (req, res) {
        try {
            req.user.tokens = ''

            await req.user.save()

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    }
}