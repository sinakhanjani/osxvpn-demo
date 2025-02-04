const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const chalk = require('chalk')
const config = require('config')

const OAuth2 = google.auth.OAuth2
const clientId = config.get('googleOauth.clientId')
const clientSecret = config.get('googleOauth.clientSecret')
const refreshToken = config.get('googleOauth.refreshToken')
const user = config.get('googleOauth.user')

module.exports = async function (html = `
    <h1> Welcome to OSXPVN <h1>
`, subject = 'OSXVPN', recipient) {
    try {
        const OAuth2_client = new OAuth2(clientId, clientSecret)
        OAuth2_client.setCredentials({ refresh_token: refreshToken })
        const transporter = nodemailer.createTransport({
            host: "mail.persianosx.top",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: 'info@persianosx.top', // your cPanel email address
              pass: 'Sevak1318', // your cPanel email password
            },
          })

        const mailoptions = {
            from: `OSXVPN info@persianosx.top`,
            to: recipient,
            subject: subject,
            // text: 'OXVVPN'
            html: html
        }

        transporter.sendMail(mailoptions, function (error, result) {
            if (!error) {
                console.log(chalk.green.bold(`Email send successfully to: ${recipient}`))
            } else {
                console.log(chalk.green.bold(error))
            }

            transporter.close()
        })
        
        // const accessTokenResponse = await OAuth2_client.getAccessToken()
        // if (accessTokenResponse.res.data) {
        //     const accessToken = accessTokenResponse.res.data.access_token
        //     const transporter = nodemailer.createTransport({
        //         service: "gmail",
        //         auth: {
        //             type: 'OAuth2',
        //             user: user,
        //             clientId: clientId,
        //             clientSecret: clientSecret,
        //             refreshToken: refreshToken,
        //             accessToken: accessToken
        //         },
        //         tls: { 
        //             rejectUnauthorized: false 
        //         }
        //     })
    
        //     const mailoptions = {
        //         from: `OSXVPN <${user}>`,
        //         to: recipient,
        //         subject: subject,
        //         // text: 'OXVVPN'
        //         html: html
        //     }

        //     transporter.sendMail(mailoptions, function (error, result) {
        //         console.log(result);
        //         if (!error) {
        //             console.log(chalk.green.bold(`Email send successfully to: ${recipient}`))
        //         } else {
        //             console.log(chalk.green.bold(error))
        //         }
    
        //         transporter.close()
        //     })
        // }
    } catch (e) {
        console.log(chalk.red.bold(`Email could not be sent to ${recipient} ${e}`))
        throw new Error(e)
    }
}