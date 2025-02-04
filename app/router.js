const path = require('path')

const userRouter = require('./modules/routers/user.router')
const adminRouter = require('./modules/routers/admin.router')

module.exports = (app) => {
    // Mark: - User API
    app.all("/api/v1/user/*", (req, res, next) => {
        let origin = req.headers.origin
        // if (origin === "https://osxvpn.shop/user") {
        res.header("Access-Control-Allow-Origin", origin)
        // }
        res.header("Access-Control-Allow-Headers", ["Content-Type", "X-Requested-With", "Authorization", "X-HTTP-Method-Override", "Accept"])
        res.header("Access-Control-Allow-Credentials", true)
        res.header("Access-Control-Allow-Methods", "GET,POST")
        res.header("Cache-Control", "no-store,no-cache,must-revalidate")
        res.header("Vary", "Origin")
        next()
    })
    app.use('/api/v1/user', userRouter)

    // MARK: - Admin API
    app.all("/api/v1/admin/*", (req, res, next) => {
        let origin = req.headers.origin
        // if (origin === "https://osxvpn.shop/admin") {
        res.header("Access-Control-Allow-Origin", origin)
        // }
        res.header("Access-Control-Allow-Headers", ["Content-Type", "X-Requested-With", "Authorization", "X-HTTP-Method-Override", "Accept"])
        res.header("Access-Control-Allow-Credentials", true)
        res.header("Access-Control-Allow-Methods", "GET,POST")
        res.header("Cache-Control", "no-store,no-cache,must-revalidate")
        res.header("Vary", "Origin")
        next()
    })
    app.use('/api/v1/admin', adminRouter)

    // MARK: - Root API
    app.use('/api/v1', (req, res, next) => {
        res.render('index', {
            title: 'OSXVPN',
            description: 'OSXVPN all right reserved | 2023',
            message: 'Application Programing Interface | V1',
            subMessage: 'You can communicate to server with "Postman API Collection" Documents.'
        })
    })

    // MARK: - admin
    const adminBuildPath = path.join(__dirname, 'build', 'admin')
    app.get('/admin/*', (req, res) => {
        res.sendFile('index.html', { root: adminBuildPath })
    })
    // MARK: - Website
    const rootBuildPath = path.join(__dirname, 'build', 'root')
    app.get('*', (req, res) => {
        res.sendFile('index.html', { root: rootBuildPath })
    })

    // MARK: - 404
    app.use('*', (req, res) => {
        res.render('404', {
            title: '404',
            description: 'OSXVPN all right reserved | 2023',
            message: 'Page not found!'
        })
    })
}