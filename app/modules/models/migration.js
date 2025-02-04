const sequelize = require('../../db/sequelize')
const User = require('./user.model')
const Admin = require('./admin.model')
const Authentication = require('./authentication.model')
const UserVpn = require('./userVpn.model')
const Order = require('./order.model')
const Vpn = require('./vpn.model')
const Product = require('./product.model')
const PerfectMoney = require('./perfectmoney.model')
const NowPayments = require('./nowpayments.model')
const Wallet = require('./wallet.model')
const Preference = require('./preference.model')
const Zarinp = require('./zarinp.model')
const Discount = require('./discount.model')
const Voucher = require('./voucher.model')
const Account = require('./account.model')
const Server = require('./server.model')
const Vps = require('./vps.model')
const Dashboard = require('./dashboard.model')
const Charge = require('./charge.model')
const { decode, encode } = require('../../helper/codable.helper')

function backup() {
    Voucher.findAll().then((items) => {
        encode(items, 'Voucher.json', 'json')
    }).catch((error) => {
        console.log(error)
    })
    NowPayments.findAll().then((items) => {
        encode(items, 'NowPayments.json', 'json')
    }).catch((error) => {
        console.log(error)
    })
    PerfectMoney.findAll().then((items) => {
        encode(items, 'PerfectMoney.json', 'json')
    }).catch((error) => {
        console.log(error)
    })
    Admin.findAll().then((items) => {
        encode(items, 'Admin.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Preference.findAll().then((items) => {
        encode(items, 'Preference.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    User.findAll().then((items) => {
        encode(items, 'User.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    UserVpn.findAll().then((items) => {
        encode(items, 'UserVpn.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Order.findAll().then((items) => {
        encode(items, 'Order.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Product.findAll().then((items) => {
        encode(items, 'Product.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Wallet.findAll().then((items) => {
        encode(items, 'Wallet.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Account.findAll().then((items) => {
        encode(items, 'Account.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Server.findAll().then((items) => {
        encode(items, 'Server.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Vps.findAll().then((items) => {
        encode(items, 'Vps.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Dashboard.findAll().then((items) => {
        encode(items, 'Dashboard.json', 'json')
    }).catch((error) => {
        console.log(error)
    })

    Charge.findAll().then((items) => {
        encode(items, 'Charge.json', 'json')
    }).catch((error) => {
        console.log(error)
    })
}


function restore() {
    decode('Admin.json', 'json', (items) => {
        Admin.bulkCreate(items).then(() => {
            decode('Dashboard.json', 'json', (items) => {
                Dashboard.bulkCreate(items).then(() => {
                    decode('Vps.json', 'json', (items) => {
                        Vps.bulkCreate(items).then(() => {
                            decode('User.json', 'json', (items) => {
                                User.bulkCreate(items).then(() => {
                                    decode('Wallet.json', 'json', (items) => {
                                        Wallet.bulkCreate(items).then(() => {
                                            decode('Product.json', 'json', (items) => {
                                                Product.bulkCreate(items).then(() => {
                                                    decode('UserVpn.json', 'json', (items) => {
                                                        UserVpn.bulkCreate(items).then(() => {
                                                            decode('Order.json', 'json', (items) => {
                                                                Order.bulkCreate(items).then(() => {
                                                                    decode('Charge.json', 'json', (items) => {
                                                                        Charge.bulkCreate(items).then(() => {
                                                                            decode('Preference.json', 'json', (items) => {
                                                                                Preference.bulkCreate(items).then(() => {
                                                                                    decode('Account.json', 'json', (items) => {
                                                                                        Account.bulkCreate(items).then(() => {
                                                                                            decode('Server.json', 'json', (items) => {
                                                                                                Server.bulkCreate(items)
                                                                                            })

                                                                                            decode('NowPayments.json', 'json', (items) => {
                                                                                                NowPayments.bulkCreate(items)
                                                                                            })
                                                                                            decode('PerfectMoney.json', 'json', (items) => {
                                                                                                PerfectMoney.bulkCreate(items)
                                                                                            })
                                                                                            decode('Voucher.json', 'json', (items) => {
                                                                                                Voucher.bulkCreate(items)
                                                                                            })
                                                                                        }).catch((error) => {
                                                                                            console.log(error)
                                                                                        })
                                                                                    })
                                                                                }).catch((error) => {
                                                                                    console.log(error)
                                                                                })
                                                                            })
                                                                        }).catch((error) => {
                                                                            console.log(error)
                                                                        })
                                                                    })
                                                                }).catch((error) => {
                                                                    console.log(error)
                                                                })
                                                            })
                                                        }).catch((error) => {
                                                            console.log(error)
                                                        })
                                                    })
                                                }).catch((error) => {
                                                    console.log(error)
                                                })
                                            })
                                        }).catch((error) => {
                                            console.log(error)
                                        })
                                    })
                                }).catch((error) => {
                                    console.log(error)
                                })
                            })
                        }).catch((error) => {
                            console.log(error)
                        })
                    })
                }).catch((error) => {
                    console.log(error)
                })
            })
        }).catch((error) => {
            console.log(error)
        })
    })
}


/// START
// 0. create empty json folder in helper
//1. comment admin and  added from index.js **** and start npm run dev
//2.
// backup()

// bug vps id in server.json
// 3deb63bc-4796-4dd8-a0a0-227e66faa231 -> b84f72d6-eba8-4388-bd0d-cb52fe4d430c

// 3. change the address server and restore
//4. commnet admin and preferences from index.js
// 5.start to craete db
//6. restore
// // //restore()
// restore()





