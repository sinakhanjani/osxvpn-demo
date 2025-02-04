const axios = require('axios')
const moment = require('moment')

module.exports = function (dashboard) {
    const baseURL = `https://${dashboard.dashboardURL}:8888`
    const username_admin = dashboard.dashboardUsername
    const password_admin = dashboard.dashboardPassword

    console.log(baseURL, username_admin, password_admin)

    const instance = axios.create({
        baseURL
    })

    return {
        login: async function (username, password) {
            try {
                const trojanRes = await instance.post('/api/auth/login', {
                    "username": username,
                    "pass": password
                })

                if (trojanRes.data && trojanRes.data.type === 'success') {
                    instance.defaults.headers.common.Authorization = `Bearer ${trojanRes.data.data.token}`
                } else {
                    throw new Error('jwt token not generated!')
                }

            } catch (e) {
                throw new Error(e)
            }
        },
        addUser: async function (userVpn) {
            try {
                const account = {
                    "quota": userVpn.trafficInMb,
                    "download": 0,
                    "upload": 0,
                    "username": userVpn.username,
                    "pass": userVpn.password,
                    "roleId": 3,
                    "deleted": 0,
                    "expireTime": moment(userVpn.expiredAt).valueOf(),
                }

                await this.login(username_admin, password_admin)

                const trojanRes = await instance.post('/api/account/createAccount', account)

                if (trojanRes.data && trojanRes.data.type === 'success') {
                    const user = await this.readUser(userVpn)

                    if (user) {
                        return user
                    } else {
                        throw new Error('user not found')
                    }
                } else {
                    throw new Error('add user failed')
                }
            } catch (e) {
                throw new Error(e)
            }
        },
        updateUser: async function (userVpn) {
            try {
                const user = await this.readUser(userVpn)

                if (user) {
                    const account = {
                        "id": user.id,
                        "quota": userVpn.trafficInMb,
                        "download": 0,
                        "upload": 0,
                        "username": userVpn.username,
                        "roleId": 3,
                        "deleted": 0,
                        "expireTime": moment(userVpn.expiredAt).valueOf(),
                    }

                    await this.login(username_admin, password_admin)
                    const trojanRes = await instance.post('/api/account/updateAccountById', account)

                    if (trojanRes.data && trojanRes.data.type === 'success') {
                        // reset current traffic 
                        instance.post('/api/account/resetAccountDownloadAndUpload', {
                            ...account,
                            quota: -1
                        })

                        return trojanRes.data
                    } else {
                        throw new Error('add user failed')
                    }
                } else {
                    throw new Error('user not found')
                }
            } catch (e) {
                throw new Error(e)
            }
        },
        deleteUser: async function (account) {
            try {
                const body = {
                    "id": parseInt(account.internalId),
                    "roleId": 3,
                    "deleted": 0,
                }

                await this.login(username_admin, password_admin)
                const trojanRes = await instance.post('/api/account/deleteAccountById', body)

                if (trojanRes.data && trojanRes.data.type === 'success') {
                    return trojanRes.data
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
                const trojanRes = await instance.get(`/api/account/selectAccountPage?pageNum=1&pageSize=100000&username=${userVpn.username}`)

                if (trojanRes.data && trojanRes.data.type === 'success') {
                    if (trojanRes.data.data.accounts.length > 0) {
                        return trojanRes.data.data.accounts[0]
                    } else {
                        throw new Error('user not found')
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
                const user_instance = axios.create({
                    baseURL
                })
                const trojanLoginRes = await user_instance.post('/api/auth/login', {
                    "username": userVpn.username,
                    "pass": userVpn.password
                })
                console.log(trojanLoginRes);
                if (trojanLoginRes && trojanLoginRes.data && trojanLoginRes.data.type === 'success') {
                    user_instance.defaults.headers.common.Authorization = `Bearer ${trojanLoginRes.data.data.token}`

                    const trojanRes = await user_instance.get(`/api/node/selectNodePage?pageNum=1&pageSize=100`)

                    if (trojanRes.data && trojanRes.data.type === 'success') {
                        return trojanRes.data.data.nodes
                    } else {
                        throw new Error('read nodes failed')
                    }
                } else {
                    throw new Error('jwt token not generated!')
                }
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        nodeURL: async function (userVpn, trojanAccount) {
            try {
                const user_instance = axios.create({
                    baseURL
                })
                const trojanLoginRes = await user_instance.post('/api/auth/login', {
                    "username": userVpn.username,
                    "pass": userVpn.password
                })

                if (trojanLoginRes && trojanLoginRes.data && trojanLoginRes.data.type === 'success') {
                    user_instance.defaults.headers.common.Authorization = `Bearer ${trojanLoginRes.data.data.token}`

                    const trojanRes = await user_instance.post(`/api/node/nodeURL`, trojanAccount)

                    if (trojanRes.data && trojanRes.data.type === 'success') {
                        const url = trojanRes.data.data
                        function insertAtIndex(str, substring, index) {
                            return str.slice(0, index) + substring + str.slice(index);
                        }
                        const indexOfHashtag = url.indexOf('#')
                        const forwardURL = insertAtIndex(url, `&host=${dashboard.dashboardURL}&fp=chrome&sni=${dashboard.dashboardURL}`, indexOfHashtag)

                        return forwardURL
                    } else {
                        throw new Error('read nodes failed')
                    }
                } else {
                    throw new Error('jwt token not generated!')
                }
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        nodeQR: async function (userVpn, trojanAccount) {
            try {
                const user_instance = axios.create({
                    baseURL
                })
                const trojanLoginRes = await user_instance.post('/api/auth/login', {
                    "username": userVpn.username,
                    "pass": userVpn.password
                })

                if (trojanLoginRes && trojanLoginRes.data && trojanLoginRes.data.type === 'success') {
                    user_instance.defaults.headers.common.Authorization = `Bearer ${trojanLoginRes.data.data.token}`

                    const trojanRes = await user_instance.post(`/api/node/nodeQRCode`, trojanAccount)

                    if (trojanRes.data && trojanRes.data.type === 'success') {
                        return trojanRes.data.data
                    } else {
                        throw new Error('read nodes failed')
                    }
                } else {
                    throw new Error('jwt token not generated!')
                }
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
    }
}