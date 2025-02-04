const axios = require('axios')
var qs = require('qs')
const jsdom = require("jsdom")
const moment = require('moment')
var convert = require('xml-js');

module.exports = function (dashboard) {
    const baseURL = dashboard.dashboardURL
    const username = dashboard.dashboardUsername
    const password = dashboard.dashboardPassword
    const Cookie = dashboard.key

    // console.log(baseURL, username, password, Cookie)

    const instance = axios.create({
        withCredentials: true,
        baseURL
    })

    function ownerIs(chargedBy, connectionLimit) {

    }

    return {
        login: async function () {
            try {
                const params = {
                    username,
                    password
                }

                const ibsRes = await instance.post('/IBSng/admin/', qs.stringify(params))

                if (ibsRes.headers['set-cookie'][0].split(';')[0]) {
                    return ibsRes.headers['set-cookie'][0].split(';')[0]
                } else {
                    throw new Error('cookies not generated!')
                }
            } catch (e) {
                throw new Error(e)
            }
        },
        addCount: async (connectionLimit) => {
            try {
                const params = {
                    'submit_form': '1',
                    'add': '1',
                    'count': '1',
                    'credit': '1',
                    'owner_name': username,
                    'group_name': connectionLimit,
                    'edit__normal_username': 'normal_username',
                    'edit__voip_username': 'voip_username'
                }

                const ibsRes = await instance.post('/IBSng/admin/user/add_new_users.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })

                if (ibsRes.data) {
                    const data = ibsRes.data + '</body></html>'

                    var object = {}
                    const dom = new jsdom.JSDOM(data)
                    const paragraphs = dom.window.document.querySelectorAll('input')

                    paragraphs.forEach((paragraph) => {
                        object[paragraph.name] = paragraph.value
                    })

                    if (object['target_id']) {
                        return object['target_id']
                    }
                }

                return null
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        addUser: async function (userVpn, account) {
            // console.log('addUser')
            try {
                const params = {
                    target: 'user',
                    target_id: account.internalId,
                    update: 1,
                    edit_tpl_cs: 'normal_username',
                    attr_update_method_0: 'normalAttrs',
                    has_normal_username: 't',
                    normal_username: userVpn.username,
                    password_character: 't',
                    password_digit: 't',
                    password_len: 6,
                    password: userVpn.password,
                }

                await instance.post('/IBSng/admin/plugins/edit.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })

                // return true
            } catch (e) {
                throw new Error(e)
            }
        },
        addTraffic: async function (userVpn, account) {
            console.log('addTraffic')
            try {
                const params = {
                    target: 'user',
                    target_id: account.internalId,
                    update: 1,
                    edit_tpl_cs: 'monthly_traffic_paccounting',
                    attr_update_method_0: 'monthlyTrafficPAccounting',
                    has_monthly_traffic_paccounting: 't',
                    traffic_periodic_accounting_monthly: 'gregorian',
                    traffic_periodic_accounting_monthly_limit: `${userVpn.trafficInMb}`
                }

                instance.post('/IBSng/admin/plugins/edit.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })
            } catch (e) {
                throw new Error(e)
            }
        },
        addMultiLogin: async function (userVpn, account) {
            console.log('addMultiLogin')
            try {
                const params = {
                    target: 'user',
                    target_id: account.internalId,
                    update: 1,
                    edit_tpl_cs: 'multi_login',
                    attr_update_method_0: 'multiLogin',
                    has_multi_login: 't',
                    multi_login: `${userVpn.connectionLimit}`,
                }

                instance.post('/IBSng/admin/plugins/edit.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })
            } catch (e) {
                throw new Error(e)
            }
        },
        addExpirationDate: async function (userVpn, account) {
            // console.log('addExpirationDate')
            try {
                const isAfterSeprateJob = ((moment(userVpn.expiredAt).isSameOrAfter('2024-07-08', 'day') && userVpn.period === '1m') || (moment(userVpn.expiredAt).isSameOrAfter('2024-08-07', 'day') && userVpn.period === '2m') || ((moment(userVpn.expiredAt).isSameOrAfter('2024-09-06', 'day') && userVpn.period === '3m'))) //moment('2024-06-08') 
                const chargedBy = isAfterSeprateJob ? '' : 'old'
                const params = {
                    target: 'user',
                    target_id: account.internalId,
                    update: 1,
                    edit_tpl_cs: 'group_name,abs_exp_date',
                    tab1_selected: 'Main',
                    attr_update_method_0: 'groupName',
                    group_name: ownerIs(chargedBy, userVpn.connectionLimit),
                    attr_update_method_1: 'absExpDate',
                    has_abs_exp: 't',
                    abs_exp_date: moment(userVpn.expiredAt).format("YYYY/MM/DD HH:mm"),
                    abs_exp_date_unit: 'gregorian'
                }

                await instance.post('/IBSng/admin/plugins/edit.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })

                // return true
            } catch (e) {
                throw new Error(e)
            }
        },
        userMonthlyTraffic: async function (account) {
            try {
                const params = {
                    user_id: account.internalId,
                    attr_edit_checkbox_27: 'monthly_traffic_paccounting',
                    edit_user: '1',
                    tab1_selected: 'Periodic_Accounting'
                }

                const ibsRes = await instance.post('/IBSng/admin/plugins/edit.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })

                if (ibsRes.data) {
                    const data = ibsRes.data + '</body></html>'

                    var object = {}
                    const dom = new jsdom.JSDOM(data)
                    const paragraphs = dom.window.document.querySelectorAll('input')

                    paragraphs.forEach((paragraph) => {
                        object[paragraph.name] = paragraph.value
                    })

                    if (object['traffic_periodic_accounting_monthly_limit']) {
                        return object['traffic_periodic_accounting_monthly_limit']
                    }

                    return '--'
                }
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteUser: async function (account) {
            try {
                const params = {
                    user_id: account.internalId,
                    delete: '1',
                    delete_comment: '',
                    delete_connection_logs: 'on',
                    delete_audit_logs: 'on',
                }

                instance.post('/IBSng/admin/user/del_user.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })
            } catch (e) {
                throw new Error(e)
            }
        },
        lockAndUnLockUser: async function (isLock, account) {
            try {
                const lockParams = {
                    target: 'user',
                    target_id: account.internalId,
                    update: 1,
                    edit_tpl_cs: 'lock',
                    attr_update_method_0: 'lock',
                    has_lock: 't',
                    lock: null
                }
                const unlockParams = {
                    target: 'user',
                    target_id: account.internalId,
                    update: 1,
                    edit_tpl_cs: 'lock',
                    attr_update_method_0: 'lock',
                }

                const params = isLock === true ? lockParams : unlockParams
                await instance.post('/IBSng/admin/plugins/edit.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })
            } catch (e) {
                throw new Error(e)
            }
        },
        connectionLog: async function (userVpn) {
            try {
                const params = {
                    show_reports: 1,
                    page: 1,
                    update: 1,
                    admin_connection_logs: 1,
                    username: userVpn.username,
                    service_internet: 'on',
                    order_by: 'login_time',
                    view_options: 4,
                    Login_Time: 'show__login_time_formatted',
                    Successful: 'show__successful'
                }

                const ibsRes = await instance.post('/IBSng/admin/report/connections.php', qs.stringify(params), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Cookie
                    }
                })

                if (ibsRes.data) {
                    const xmlData = '<?xml version=”1.0" encoding=”UTF-8"?>' + ibsRes.data
                    const js = convert.xml2json(xmlData, { compact: true, spaces: 4 })

                    return JSON.parse(js)
                } else {
                    throw new Error('could not convert.')
                }
            } catch (e) {
                throw new Error(e)
            }
        },
    }
}