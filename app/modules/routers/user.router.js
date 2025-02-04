const express = require('express')
const router = new express.Router()

const auth = require('../../middleware/middleware.user')
const structure = require('../../middleware/middleware.structure')

const userController = require('../controllers/user.controller')
const authController = require('../controllers/authentication.controller')
const productController = require('../controllers/product.controller')
const orderController = require('../controllers/order.controller')
const perfectMoneyController = require('../controllers/perfectMoney.controller')
const nowPaymentsController = require('../controllers/nowpayments.controller')
const walletController = require('../controllers/wallet.controller')
const preferenceController = require('../controllers/preference.controller')
const zarinpController = require('../controllers/zarinpal.controller')
const userVpnController = require('../controllers/userVpn.controller')
const vpsController = require('../controllers/vps.controller')

// Auth
router.post('/auth/sendCode', structure, authController.sendCode)
router.post('/auth/verifyCode', structure, authController.verifyCode)

// Profile
router.post('/profile/logout', auth, userController.logout)
router.get('/profile/me', auth, userController.me)

// Product
router.get('/product', structure, productController.read)

// Vps
router.get('/vps', auth, vpsController.readCapicity)

// Order
router.get('/order', auth, orderController.read)

// Payment
router.post('/pay/perfectmoney/:productId', auth, perfectMoneyController.active)

// NowPayments
router.get('/pay/nowpayments/callback', auth, nowPaymentsController.callbackIPN)
router.post('/pay/nowpayments/create', auth, nowPaymentsController.createPaymentLink)

// Wallet
router.post('/pay/wallet', auth, walletController.payByWallet)

// Zarinpal
router.get('/pay/zarinp/create/:productId', auth, zarinpController.create)
router.get('/pay/zarinp/verification', auth, zarinpController.verification)

// Preference
router.get('/preference', structure, preferenceController.read)

// UserVpn
router.get('/uservpn/traffic/:serverId', auth, userVpnController.traffic)
router.get('/uservpn/readtrojan/:userVpnId', auth, userVpnController.readTrojan)
router.get('/uservpn/trojan/nodelist/:userVpnId', auth, userVpnController.readNodeList)
router.post('/uservpn/trojan/nodeurl/:userVpnId', auth, userVpnController.readNodeURL)
router.post('/uservpn/trojan/nodeqr/:userVpnId', auth, userVpnController.readNodeQR)
router.post('/uservpn/addnote/:userVpnId', auth, userVpnController.addNote)
// ...
router.post('/uservpn/lock/:userVpnId', auth, userVpnController.lockAndUnlock)
router.post('/uservpn/editpassword/:userVpnId', auth, userVpnController.editPassword)
router.post('/uservpn/connectionlog/:userVpnId', auth, userVpnController.log)

module.exports = router