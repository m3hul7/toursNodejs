const nodemailer =  require('nodemailer')

const sendEmail = async (options) => {
    // create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        // providerauth: {user: process.env.EMAIL_USERNAME}, // user -> important
        // pass: process.env.EMAIL_PASSWORD // pass -> important (do not use password)
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // define the email options
    const mailOptions = {
        from: 'User <user@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // actually send the email
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail 
