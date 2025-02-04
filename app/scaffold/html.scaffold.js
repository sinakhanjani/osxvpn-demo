const sendEMail = require('../helper/nodemailer.helper')

const sendCodeHTML = function (code, email) {
    //
    sendEMail(`
    <!DOCTYPE html>
    <html>
    
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OSX Email Verification</title>
    </head>
    
    <body style="font-family: arial; padding: 16px;">
      <section>
        <div>
          <p>Hello</p>
          <h2 style="color:#2C5F84">Thank you for choosing OSX</h2>
          <p">To continue with your email verification, please enter the following code.</p>
            <h1 style="color:#2C5F84">Verification Code: ${code}</h1>
            <p>Your verification code will expire in 3 minute
              minutes. If you are having trouble logging in with this code, please contact our support,
              ipersianvpn@gmail.com We are here to help you at any step along the way.</p>
            <p>email us if you have any ideas or questions</p>
            <p>Best regards,</p>
        </div>
      </section>
      <footer>
        <h4 style="color:#2C5F84">OSX Team</h4>
        <p>OSX | Virtual Private Network </p>
      </footer>
    </body>
    
    </html>
    `, 'Verfication code', email)
}

const verifyCodeHTML = function (user) {
    //
    sendEMail(`
    <!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSX VPN</title>
</head>

<body style="font-family: arial; padding: 16px;">
    <section>
        <div style="align-items: left; text-align: left; flex-grow: 100;">
            <h4>Welcome to OSX ${user.email}<h4>
        </div>
    </section>
    <footer>
        <h4 style="color:#2C5F84">OSX Team</h4>
            <p>OSX | Virtual Private Network </p>
    </footer>
</body>

</html>
`, 'OSX Verification Complete', user.email)
}

const myOrderReceiptHTML = function (user, order) {
    //
    sendEMail(`
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OSX VPN</title>
    </head>
    
    <body style="font-family: arial; padding: 16px;">
        <section>
            <div style="align-items: left; text-align: left; flex-grow: 100;">
                <h1>Receipt</h1>
                <p>Amount Rial: ${order.amount_rial}</p>
                <p>Amount Dollar: ${order.amount_dollar}</p>
                <p>receipt: ${order.receipt}</p>
                <p>Payment Method: ${order.paymentMethod}</p>
                <p>Order Type: ${order.creator}</p>
                <p>You can get your subscription from the user profile section on the website</p>
            </div>
        </section>
        <footer>
            <h4 style="color:#2C5F84">OSX Team</h4>
            <p>OSX | Virtual Private Network </p>
        </footer>
    </body>
    </html>
    `, 'OSX Receipt', user.email)
}

const expireVPNHTML = function (user, userVpn) {
    sendEMail(`
    <!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSX VPN</title>
</head>

<body style="font-family: arial; padding: 16px;">
    <section>
        <div style="align-items: left; text-align: left; flex-grow: 100;">
        <p>Your VPN user ${userVpn.username} subscription service will be expired soon, renew it via the website</p>
        </div>
    </section>
    <footer>
        <h4 style="color:#2C5F84">OSX Team</h4>
            <p>OSX | Virtual Private Network </p>
    </footer>
</body>

</html>
    `, 'Your VPN will be expired soon', user.email)
}

const vpnExpiredHTML = function (user, userVpn) {
    sendEMail(`
    <!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSX VPN</title>
</head>

<body style="font-family: arial; padding: 16px;">
    <section>
        <div style="align-items: left; text-align: left; flex-grow: 100;">
        <p>Your VPN user ${userVpn.username} subscription has expired, please renew your subscription by logging in to the site and from the user profile section</p>
        </div>
    </section>
    <footer>
        <h4 style="color:#2C5F84">OSX Team</h4>
            <p>OSX | Virtual Private Network </p>
    </footer>
</body>

</html>
    `, 'Your VPN has expired', user.email)
}

const vpnFinishedHTML = function (user) {
    //
    sendEMail('', 'OSX | VPN Finished', user.email)
}

const vpsErrHTML = function (user) {
    //
    sendEMail(`
    <!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSX VPN</title>
</head>

<body style="font-family: arial; padding: 16px;">
    <section>
        <div style="align-items: left; text-align: left; flex-grow: 100;">
            
        </div>
    </section>
    <footer>
        <h4 style="color:#2C5F84">OSX Team</h4>
            <p>OSX | Virtual Private Network </p>
    </footer>
</body>

</html>
    `, 'OSX | VPS Error', user.email)
}

// const deficiencyDBVPNHTML = function (admin) {
//     // this is for future update.
//     // this email send to admin when vpn is shortage in database.
//     // sendEMail('<h1> Welcome to OSXPVN <h1>', 'OSXPV', user.email)
// }

const referrerBonusHTML = function (user, referralUser, amount_dollar) {
    sendEMail(`
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OSX VPN</title>
    </head>
    
    <body style="font-family: arial; padding: 16px;">
        <section>
            <div style="align-items: left; text-align: left; flex-grow: 100;">
                <div>
                <h3>Receive referral code bonus<h3>
                <p>Dear user, the amount of ${amount_dollar} dollars due to the introduction of the site to ${referralUser.email} to the wallet have been added</p>
                </div>
            </div>
        </section>
            <h4 style="color:#2C5F84">OSX Team</h4>
            <p>OSX | Virtual Private Network </p>
        </footer>
    </body>
    
    </html>
    `, 'OSX Bonus', user.email)
}

module.exports = {
    sendCodeHTML,
    verifyCodeHTML,
    myOrderReceiptHTML,
    expireVPNHTML,
    vpnFinishedHTML,
    referrerBonusHTML,
    vpnExpiredHTML,
    vpsErrHTML
}