const User = require('./user.model')
const Admin = require('./admin.model')
const Authentication = require('./authentication.model')
const UserVpn = require('./userVpn.model')
const Order = require('./order.model')
const Vpn = require('./vpn.model')
const Product = require('./product.model')
const sequelize = require('../../db/sequelize')
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
const { Op } = require("sequelize");
const moment = require('moment')

User.hasMany(Authentication, {
    foreignKey: 'userId',
    as: 'authentications'
})
User.hasMany(UserVpn, {
    foreignKey: 'userId',
    as: 'userVpns'
})
User.hasOne(Wallet, {
    foreignKey: 'userId',
    as: 'wallet'
})

Wallet.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

Authentication.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

UserVpn.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})
UserVpn.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
})
UserVpn.hasOne(Order, {
    foreignKey: 'userVpnId',
    as: 'order'
})
UserVpn.hasMany(Account, {
    foreignKey: 'userVpnId',
    as: 'accounts'
})
UserVpn.hasMany(Server, {
    foreignKey: 'userVpnId',
    as: 'servers'
})

Order.belongsTo(UserVpn, {
    foreignKey: 'userVpnId',
    as: 'userVpn'
})
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})
Order.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
})

PerfectMoney.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
})
PerfectMoney.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

NowPayments.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
})
NowPayments.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

Zarinp.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
})
Zarinp.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

Discount.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
})
Discount.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})
Discount.belongsTo(UserVpn, {
    foreignKey: 'userVpnId',
    as: 'userVpn'
})

Voucher.belongsTo(Admin, {
    foreignKey: 'adminId',
    as: 'admin'
})

Dashboard.hasMany(Vps, {
    foreignKey: 'dashboardId',
    as: 'all_vps'
})

Vps.belongsTo(Dashboard, {
    foreignKey: 'dashboardId',
    as: 'dashboard'
})

Server.belongsTo(UserVpn, {
    foreignKey: 'userVpnId',
    as: 'userVpn'
})
Server.belongsTo(Vps, {
    foreignKey: 'vpsId',
    as: 'vps'
})
Server.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

Account.belongsTo(UserVpn, {
    foreignKey: 'userVpnId',
    as: 'userVpn'
})
Account.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})
// This use only for trojan services
Account.belongsTo(Dashboard, {
    foreignKey: 'dashboardId',
    as: 'dashboard'
})

Vpn.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
})
Vpn.belongsTo(Vps, {
    foreignKey: 'vpsId',
    as: 'vps'
})

Charge.belongsTo(Admin, {
    foreignKey: 'adminId',
    as: 'admin'
})
Charge.belongsTo(Wallet, {
    foreignKey: 'walletId',
    as: 'wallet'
})
Charge.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})
Charge.belongsTo(UserVpn, {
    foreignKey: 'userVpnId',
    as: 'userVpn'
})

sequelize.sync({

}).then(() => {

}).catch((error) => {
    //
})