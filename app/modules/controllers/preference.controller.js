const message = require('../../scaffold/message.scaffold')
const Preference = require('../models/preference.model')
const moment = require('moment')

module.exports = {
    // For admin
    update: async function (req, res) {
        try {
            await Preference.update(req.body, { where: {} })
            
            res.scaffold.success(message.success)
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    time: async function (req, res) {
        try {
            const time = req.body.time
            
            res.scaffold.add({
                teh: moment(time).tz("Asia/Tehran").format("YYYY-MM-DD HH:mm ZZ")
            })
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
    // For user
    read: async function (req, res) {
        try {
            const preference = await Preference.findOne()
            
            if (preference) {
                res.scaffold.add(preference)
            } else {
                res.scaffold.failed(message.notFound)
            }
        } catch (e) {
            res.scaffold.eFailed(e)
        }
    },
}