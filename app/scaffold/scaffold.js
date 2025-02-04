const message = require('./message.scaffold')

module.exports = function (response) {
    return {
        res: {
            success: true,
            data: null,
            message: ''
        },
        add: function (data) {
            this.res.data = data
            this.res.success = true
            this.res.message = message.success.res
            this.res.code = message.success.code
            response.status(200).send(this.res)
        },
        success: function (message) {
            this.res.data = undefined
            this.res.success = true
            this.res.message = message.res
            this.res.code = message.code
            response.status(200).send(this.res)
        },
        failed: function (message = message.unknown) {
            this.res.data = undefined
            this.res.success = false
            this.res.message = message.res
            this.res.code = message.code
            response.status(406).send(this.res)
        },
        eFailed: function (e) {
            this.res.data = e
            this.res.success = false
            this.res.message = message.unknown.res
            this.res.code = message.unknown.code
            response.status(message.unknown.code).send(this.res)
        }
    }
}
