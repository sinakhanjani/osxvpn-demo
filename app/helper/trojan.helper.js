const axios = require('axios')
const moment = require('moment')
var qs = require('qs')

module.exports = function (dashboard) {
    const baseURL = dashboard.dashboardURL
    const username_admin = dashboard.dashboardUsername
    const password_admin = dashboard.dashboardPassword
    const token = dashboard.key

    const instance = axios.create({
        baseURL
    })
    instance.defaults.headers.common.Authorization = `Bearer ${token}`

    console.log(baseURL, username_admin, password_admin, instance.defaults.headers.common.Authorization)

    return {
        login: async function (username, password) {
            try {
                const params = {
                    username,
                    password
                }

                const trojanRes = await instance.post('/api/admin/token', qs.stringify(params))

                if (trojanRes.data && trojanRes.data.access_token) {
                    instance.defaults.headers.common.Authorization = `Bearer ${trojanRes.data.access_token}`
                    return true
                } else {
                    throw new Error('jwt token not generated!')
                }

            } catch (e) {
                throw new Error(e)
            }
        },
        addUser: async function (userVpn, unitPerGB = 1) {
            try {
                const account = {
                    "username": userVpn.username,
                    "proxies": {
                        "trojan": {
                        },
                        "vless": {
                        },
                        "vmess": {
                        }
                    },
                    "expire": moment(userVpn.expiredAt).unix(),
                    "data_limit": userVpn.trafficInKB * 10 * unitPerGB,
                    "data_limit_reset_strategy": "no_reset"
                }
                await this.login(username_admin, password_admin)
                const trojanRes = await instance.post('/api/user', account)

                if (trojanRes.data) {
                    return {
                        "id": userVpn.username,
                        "quota": trojanRes.data.data_limit,
                        "download": trojanRes.data.used_traffic,
                        "upload": 0,
                        "username": userVpn.username,
                        "email": "",
                        "roleId": 3,
                        "deleted": 0,
                        "expireTime": moment.unix(trojanRes.data.expire).valueOf(),
                        "createTime": trojanRes.data.created_at,
                        "roles": null
                    }
                } else {
                    throw new Error('add user failed')
                }
            } catch (e) {
                // console.log(e);
                throw new Error(e)
            }
        },
        updateUser: async function (userVpn, unitPerGB = 1) {
            try {
                const account = {
                    "expire": moment(userVpn.expiredAt).unix(),
                    "data_limit": userVpn.trafficInKB * 10 * unitPerGB,
                    status: 'active'
                }
                await this.login(username_admin, password_admin)
                const resetRes = await instance.post(`/api/user/${userVpn.username}/reset`)

                if (resetRes.data) {
                    const trojanRes = await instance.put(`/api/user/${userVpn.username}`, account)

                    if (trojanRes.data) {                        
                        return {
                            "id": userVpn.username,
                            "quota": trojanRes.data.data_limit,
                            "download": trojanRes.data.used_traffic,
                            "upload": 0,
                            "username": userVpn.username,
                            "email": "",
                            "roleId": 3,
                            "deleted": 0,
                            "expireTime": moment.unix(trojanRes.data.expire).valueOf(),
                            "createTime": trojanRes.data.created_at,
                            "roles": null
                        }
                    } else {
                        throw new Error('update user failed') 
                    }
                } else {
                    throw new Error('update user failed')
                }                
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteUser: async function (account) {
            try {
                await this.login(username_admin, password_admin)
                const trojanRes = await instance.delete(`/api/user/${account.internalId}`)

                if (trojanRes.data) {
                    return {
                        "code": 20000,
                        "type": "success",
                        "message": "",
                        "data": null
                    }
                } else {
                    throw new Error('update user failed')
                }
            } catch (e) {
                throw new Error(e)
            }
        },
        readUser: async function (userVpn) {
            try {
                await this.login(username_admin, password_admin)
                const trojanRes = await instance.get(`/api/user/${userVpn.username}`)

                if (trojanRes.data) {
                    return {
                        "id": userVpn.username,
                        "quota": trojanRes.data.data_limit,
                        "download": trojanRes.data.used_traffic,
                        "upload": 0,
                        "username": userVpn.username,
                        "email": "",
                        "roleId": 3,
                        "deleted": 0,
                        "expireTime": moment.unix(trojanRes.data.expire).valueOf(),
                        "createTime": trojanRes.data.created_at,
                        "roles": null
                    }
                } else {
                    throw new Error('read user failed')
                }
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        // for users
        nodeRead: async function (userVpn) {
            try {

                function nodeTitle(str) {
                    if (str.toUpperCase().includes('TROJAN-WS')) {
                        return 'Trojan اتصال با'
                    }
                    if (str.toUpperCase().includes('VLESS-WS')) {
                        return 'Vless اتصال با'
                    }

                    return 'V2RAY'
                }
                await this.login(username_admin, password_admin)
                const trojanRes = await instance.get(`/api/user/${userVpn.username}`)

                if (trojanRes.data) {
                    const nodes = trojanRes.data.links.filter((item) => (item.toUpperCase().includes('OSX') && item.toUpperCase().includes('WS') && !item.toUpperCase().includes('VLESS-WS') )).map((item, index) => ({
                        "id": index,
                        "nodeServerId": 1,
                        "nodeSubId": 29,
                        "nodeTypeId": 1,
                        "name": nodeTitle(item),
                        "domain": item,
                        "port": 443,
                        "createTime": trojanRes.data.created_at,
                        "status": 1
                    })).sort((a, b) => a.name.localeCompare(b.name))

                    return nodes
                } else {
                    throw new Error('read nodes failed')
                }
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        nodeURL: async function (userVpn, trojanAccount) {
            try {
                await this.login(username_admin, password_admin)
                const trojanRes = await instance.get(`/api/user/${userVpn.username}`)
                if (trojanRes.data.links) {
                    const url = trojanRes.data.links.find((item) => item === trojanAccount.domain)

                    return url
                } else {
                    throw new Error('read nodes failed')
                }
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        nodeQR: async function (userVpn, trojanAccount) {
            try {
                await this.login(username_admin, password_admin)
                const trojanRes = await instance.get(`/api/user/${userVpn.username}`)
                if (trojanRes.data.links) {
                    const url = trojanRes.data.links.find((item) => item === trojanAccount.domain)

                    return url
                } else {
                    throw new Error('read nodes failed')
                }
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        lockAndUnLockUser: async function (isLock, userVpn) {
            try {
                const lockParams = { status: 'disabled' }
                const unlockParams = { status: 'active' }
                const params = isLock === true ? lockParams : unlockParams

                await this.login(username_admin, password_admin)
                await instance.put(`/api/user/${userVpn.username}`, params)
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
    }
}