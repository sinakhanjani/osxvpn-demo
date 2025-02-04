const axios = require('axios')
const moment = require('moment')

module.exports = function (dashboard) {
    const baseURL = dashboard.dashboardURL
    const username = dashboard.dashboardUsername
    const password = dashboard.dashboardPassword
    const Cookie = dashboard.key
    const type = dashboard.protocol

    console.log(baseURL, username, password, Cookie)

    function randomCode() {
        const min = 10000
        const max = 77777
        const digit = Math.floor(Math.random() * (max - min + 1)) + min

        return digit
    }

    return {
        login: async function () {
            try {
                const xuiRes = await axios.post(`${baseURL}/login?username=${username}&password=${password}`)

                if (xuiRes.data.success === true) {
                    return xuiRes.headers['set-cookie'][0].split(';')[0]
                }

                return null
            } catch (e) {
                throw new Error(e)
            }
        },
        addUser: async function (userVpn, accountCount, u4, vps, unitPerGB = 1) {
            try {
                const settings = type === 'vmess' ? `{"clients": [ {  "id": "${u4}", "alterId": 0 }  ], "disableInsecureEncryption": false}` : `{"clients": [ {  "id": "${u4}", "flow": "xtls-rprx-direct" }  ], "decryption": "none", "fallbacks":[]}`
                const params = new URLSearchParams({
                    total: `${userVpn.trafficInKB * unitPerGB}`,
                    remark: `${userVpn.username}`,
                    enable: true,
                    expiryTime: `${moment(userVpn.expiredAt).valueOf()}`, // st expiry date
                    port: `${randomCode() + accountCount}`, // set random port
                    protocol: type,
                    settings,
                    streamSettings: '{"network": "tcp",  "security": "none", "tcpSettings": { "header": {"type": "none"}}}',
                    sniffing: '{"enabled": true, "destOverride": [ "http", "tls" ] }'
                }).toString()

                var config = {
                    method: 'post',
                    url: `${baseURL}/xui/inbound/add?${params}`,
                    headers: {
                        'Cookie': Cookie
                    }
                }

                const xuiRes = await axios(config)

                if (xuiRes.data.success === true) {
                    // FIX* FOR VMESS URL
                    const url = type === 'vmess' ? `Please contact support.` : `vless://${u4}@${vps.server}/?type=tcp&security=none#${userVpn.username}`

                    return url
                }

                return null
            } catch (e) {
                console.log(e)
                throw new Error(e)
            }
        },
        updateUser: async function (userVpn, account, unitPerGB = 1) {
            try {
                var listConfig = {
                    method: 'post',
                    url: `${baseURL}/xui/inbound/list`,
                    headers: {
                        'Cookie': Cookie
                    }
                }
                const xuiListRes = await axios(listConfig)

                if (xuiListRes.data.obj) {
                    const remark = account.internalId
                    const object = xuiListRes.data.obj.find((element) => (element.remark === remark))
                    const settings_parse = JSON.parse(object.settings)

                    if (settings_parse.clients[0]) {
                        const id = settings_parse.clients[0].id //uuv4 id
                        // updateID
                        const settings = (type === 'vmess') ? `{"clients": [{ "id": "${id}", "alterId": 0 }], "disableInsecureEncryption": false}` : `{"clients": [ {  "id": "${id}", "flow": "xtls-rprx-direct" }  ], "decryption": "none", "fallbacks":[]}`
                        const params = new URLSearchParams({
                            total: `${userVpn.trafficInKB * unitPerGB}`,
                            remark: `${object.remark}`,
                            enable: true,
                            expiryTime: `${moment(userVpn.expiredAt).valueOf()}`, // st expiry date
                            port: `${object.port}`, // set random port
                            protocol: object.protocol,
                            settings,
                            streamSettings: '{"network": "tcp",  "security": "none", "tcpSettings": { "header": {"type": "none"}}}',
                            sniffing: '{"enabled": true, "destOverride": [ "http", "tls" ] }'
                        }).toString()

                        var updateConfig = {
                            method: 'post',
                            url: `${baseURL}/xui/inbound/update/${object.id}?${params}`,
                            headers: {
                                'Cookie': Cookie
                            }
                        }

                        const xuiRes = await axios(updateConfig)

                        if (xuiRes.data.success === true) {
                            console.log('Update User successfully')
                        }
                    }
                }
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteUser: async function (account) {
            try {
                var listConfig = {
                    method: 'post',
                    url: `${baseURL}/xui/inbound/list`,
                    headers: {
                        'Cookie': Cookie
                    }
                }
                const xuiListRes = await axios(listConfig)

                if (xuiListRes.data) {
                    const remark = account.internalId
                    const id = xuiListRes.data.obj.find((element) => (element.remark === remark)).id

                    if (id) {
                        var delConfig = {
                            method: 'post',
                            url: `${baseURL}/xui/inbound/del/${id}`,
                            headers: {
                                'Cookie': Cookie
                            }
                        }

                        const xuiDelRes = await axios(delConfig)

                        if (xuiDelRes.data.success === true) {
                            // success opertation
                            console.log('User deleted successfuly from db.')
                        }
                    }
                }
            } catch (e) {
                throw new Error(e)
            }
        },
        userMonthlyTraffic: async function (account) {
            try {
                var listConfig = {
                    method: 'post',
                    url: `${baseURL}/xui/inbound/list`,
                    headers: {
                        'Cookie': Cookie
                    }
                }

                const xuiListRes = await axios(listConfig)

                if (xuiListRes.data) {
                    console.log(xuiListRes.data)
                    const remark = account.internalId
                    const object = xuiListRes.data.obj.find((element) => (element.remark === remark))
                    const download = object.down

                    return (download / 1000) / 1000
                }

                return '--'
            } catch (e) {
                throw new Error(e)
            }
        },
    }
}