const { vpnExpiredHTML, expireVPNHTML } = require('./scaffold/html.scaffold')
var cron = require('node-cron')
const moment = require('moment')
const UserVpn = require('./modules/models/userVpn.model')
const User = require('./modules/models/user.model')
const { Op } = require("sequelize");
// const ibsng = require('./helper/ibsng.helper')
// const Dashboard = require('./modules/models/dashboard.model')

// var date = moment().tz("Asia/Tehran").format("YYYY-MM-DD HH:mm ZZ")

var cronJob = cron.schedule('30 21 * * *', async () => {
    // every day at 00:00 tehran time
    const todayWillExpiredUserVpns = await UserVpn.findAll({
        where: {
            expiredAt: {
                [Op.gt]: moment().startOf('day').toString(),
                [Op.lt]: moment().endOf('day').toString()
            }
        },
        include: [
            { model: User, as: 'user' },
        ]
    })
    const xDayWillExpiredUserVpns = await UserVpn.findAll({
        where: {
            expiredAt: {
                [Op.gt]: moment().add(4, 'd').startOf('day').toString(),
                [Op.lt]: moment().add(4, 'd').endOf('day').toString()
            }
        },
        include: [
            { model: User, as: 'user' },
        ]
    })

    if (todayWillExpiredUserVpns) {
        todayWillExpiredUserVpns.forEach(todayWillExpiredUserVpn => {
            vpnExpiredHTML(todayWillExpiredUserVpn.user, todayWillExpiredUserVpn)
        })
    }
    if (xDayWillExpiredUserVpns) {
        xDayWillExpiredUserVpns.forEach(xDayWillExpiredUserVpn => {
            expireVPNHTML(xDayWillExpiredUserVpn.user, xDayWillExpiredUserVpn)
        })
    }
}, {
    scheduled: true,
    timezone: "Asia/Tehran"
})

// var ibsJob = cron.schedule('0 0 * * *', async () => {
//     Dashboard.findOne({ where: { protocol: 'ibs' } }).then((dashboard) => {
//         if (dashboard) {
//             ibsng(dashboard).login().then((key) => {
//                 dashboard.key = key
//                 dashboard.save()
//             })
//         }
//     })
// }, {
//     scheduled: true,
//     timezone: "Asia/Tehran"
// })

// ibsJob.start()
cronJob.start()