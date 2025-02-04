const express = require('express')
const router = new express.Router()
const multer = require('../../helper/multer.helper')

const auth = require('../../middleware/middleware.admin')
const structure = require('../../middleware/middleware.structure')

const adminController = require('../controllers/admin.controller')
const vpnController = require('../controllers/vpn.controller')
const userController = require('../controllers/user.controller')
const productController = require('../controllers/product.controller')
const orderController = require('../controllers/order.controller')
const perfectMoneyController = require('../controllers/perfectMoney.controller')
const nowPaymentsController = require('../controllers/nowpayments.controller')
const preferenceController = require('../controllers/preference.controller')
const userVpnController = require('../controllers/userVpn.controller')
const walletController = require('../controllers/wallet.controller')
const zarinpController = require('../controllers/zarinpal.controller')
const vpsController = require('../controllers/vps.controller')
const dashboardController = require('../controllers/dashboard.controller')
const chargeController = require('../controllers/charge.controller')
const reportController = require('../controllers/report.controller')

// Admin
router.get('/auth/me', auth, adminController.me)
router.post('/auth/login', structure, adminController.login)
router.get('/auth/walletcharge', auth, adminController.charge)

// VPN
router.get('/vpn', auth, vpnController.read)
router.post('/vpn/create/:productId', auth, vpnController.create)
router.post('/vpn/update/:id', auth, vpnController.update)
router.post('/vpn/delete/:id', auth, vpnController.delete)
router.post('/vpn/updatemany', auth, vpnController.updateMany)
router.post('/vpn/deletemany', auth, vpnController.deleteMany)
router.post('/vpn/updateuservpn', auth, vpnController.updateUserVpnIBS)

// UserVpn
router.get('/uservpn', auth, userVpnController.read)
router.post('/uservpn/create/admin', auth, userVpnController.createByAdmin)
router.post('/uservpn/create/system', auth, userVpnController.createBySystem)
router.post('/uservpn/update/admin/:id', auth, userVpnController.updateByAdmin)
router.post('/uservpn/update/system', auth, userVpnController.updateBySystem)
router.post('/uservpn/updatemany', auth, userVpnController.updateMany)
router.post('/uservpn/delete/:id', auth, userVpnController.delete)
router.post('/uservpn/updatedashboardaccounts/:id', auth, userVpnController.updateDashboardAccounts)
//--
router.get('/uservpn/readtrojan/:userVpnId', auth, userVpnController.readTrojanByAdmin)
router.get('/uservpn/trojan/nodelist/:userVpnId', auth, userVpnController.readNodeListByAdmin)
router.post('/uservpn/trojan/nodeurl/:userVpnId', auth, userVpnController.readNodeURLByAdmin)
// ---
router.post('/uservpn/lock/:userVpnId', auth, userVpnController.lockAndUnlockByAdmin)
router.post('/uservpn/editpassword/:userVpnId', auth, userVpnController.editPasswordByAdmin)
router.post('/uservpn/connectionlog/:userVpnId', auth, userVpnController.logByAdmin)

// Product
router.get('/product', auth, productController.readByAdmin)
router.post('/product/create', auth, productController.create)
router.post('/product/update/:id', auth, productController.update)
router.post('/product/delete/:id', auth, productController.delete)

// User
router.get('/user', auth, userController.readByAdmin)
router.get('/user/readone', auth, userController.readOneByAdmin)
router.post('/user/create', auth, userController.create)
router.post('/user/delete/:id', auth, userController.delete)

router.post('/user/support/email/send', auth, userController.sendEmail)
router.post('/user/support/email/vpschanged', auth, userController.vpsChanGToAll)
router.post('/user/wallet/charge/:userId', auth, walletController.charge)

// Order
router.get('/order', auth, orderController.readByAdmin)

// PerfectMoney
router.get('/pay/perfectmoney/balance', auth, perfectMoneyController.balance)
router.post('/pay/perfectmoney/create', auth, perfectMoneyController.create)
router.get('/pay/perfectmoney', auth, perfectMoneyController.readByAdmin)

// NowPayments
router.post('/pay/nowpayments/webhook', structure, nowPaymentsController.webhookIPN)
router.get('/pay/nowpayments', auth, nowPaymentsController.readByAdmin)

// Zarinpal
router.get('/pay/zarinp', auth, zarinpController.readByAdmin)

// Preference
router.post('/preference/update', auth, preferenceController.update)
router.post('/preference/time', auth, preferenceController.time)

// Vps
router.get('/vps', auth, vpsController.read)
router.post('/vps/create', auth, vpsController.create)
router.post('/vps/update/:id', auth, vpsController.update)
router.post('/vps/delete/:id', auth, vpsController.delete)
router.post('/vps/updateprofile/:id', auth, multer.single('profile'), vpsController.updateProfile)

// Dashboard
router.get('/dashboard', auth, dashboardController.read)
router.post('/dashboard/create', auth, dashboardController.create)
router.post('/dashboard/update/:id', auth, dashboardController.update)
router.post('/dashboard/delete/:id', auth, dashboardController.delete)
router.post('/dashboard/transfer', auth, dashboardController.transfer)

// Charges
router.get('/charge', auth, chargeController.read)

// Report
router.get('/report', auth, reportController.read)

module.exports = router
