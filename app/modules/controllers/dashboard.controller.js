const message = require('../../scaffold/message.scaffold')
const Vps = require('../models/vps.model')
const Dashboard = require('../models/dashboard.model')
const UserVpn = require('../models/userVpn.model')
const Account = require('../models/account.model')

const ibsng = require('../../helper/ibsng.helper')


module.exports = {
    // For admin
    create: async function (req, res) {
        try {
            const vps = await Dashboard.create(req.body)

            res.scaffold.success(message.success)
        } catch (e) {
            console.log(e);
            res.scaffold.eFailed(e)
        }
    },
    update: async function (req, res) {
        try {
            const id = req.params.id
            const body = req.body

            await Dashboard.update(body, { where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    read: async function (req, res) {
        try {
            var where = req.query

            const vpns = await Dashboard.findAll({
                where,
                include: [
                    {
                        model: Vps,
                        as: 'all_vps'
                    }
                ]
            })

            res.scaffold.add(vpns)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    delete: async function (req, res) {
        try {
            const id = req.params.id

            await Dashboard.destroy({ where: { id } })

            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    transfer: async function (req, res) {
        // try {
        //     const ibsng = require('../../helper/ibsng.helper')
        //     UserVpn.findAll({ where: { ibsTable: false } }).then((userVpns) => {
        //         // task for each uservpn
        //         const task = (userVpn, index) => {
        //             const dashboard = {
        //                 "dashboardURL": "http://91.107.146.191", // add ip ****
        //                 "key": "IBS_SESSID=64qe43usdtup7puibntq0quk00", // add this key ****
        //                 "dashboardUsername": "system",
        //                 "dashboardPassword": "sevak1318"
        //             }
            
        //             Account.findOne({ where: { userVpnId: userVpn.id } }).then((account) => {
        //                 if (account) {
        //                     console.log(`*${index}*start_id: *`, userVpn.username);
        // const connectionLimit = userVpn.connectionLimit === 1 ? 'User1' : 'Business'
        //                     ibsng(dashboard).addCount(connectionLimit).then((objectId) => {
        //                         if (objectId) {
        //                             account.internalId = `${objectId}`
        //                             userVpn.ibsTable = true
            
        //                             ibsng(dashboard).addUser(userVpn, account).then(() => {
        //                                 ibsng(dashboard).addExpirationDate(userVpn, account)
        //                                 account.save().then(() => {
        //                                     userVpn.save()
        //                                 })
        //                                 console.log(`$${index}$end_id: $`, userVpn.username, account.internalId, objectId);
        //                             })
        //                         }
        //                     })
        //                 }
        //             })
        //         }
        //         // transfer method
        //         const transfer = (i) => {
        //             var index = i
            
        //             const userVpn = userVpns[index]
        //             const length = userVpns.length
            
        //             setTimeout(
        //                 () => {
        //                     // add to ibs
        //                     task(userVpn, index)
        //                     // add index
        //                     index += 1
        //                     // check for end
        //                     if (index + 1 <= length) {
        //                         transfer(index)
        //                     }
        //                 },
        //                 4000
        //             )
        //         }
        //         // start add to ibs from 0 index
        //         transfer(0)
        //     })            

        //     res.scaffold.success(message.success)
        // } catch (e) {
        //     res.scaffold.eFailed(e)
        // }
    },
}