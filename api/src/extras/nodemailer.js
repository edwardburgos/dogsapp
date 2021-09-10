const nodemailer = require('nodemailer');
const { google } = require('googleapis')

const oAuth2Client = new google.auth.OAuth2(process.env.GMAIL_API_CLIENT_ID, process.env.GMAIL_API_CLIENT_SECRET, process.env.GMAIL_API_REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_API_REFRESH_TOKEN })

async function sendMail(name, addressee, reason, token) {
    try {
        let url = 'http://localhost:3000'
        if (reason === 'verifyEmail' && token) {
            url = `${url}/${reason}/${token.token}?expires=${token.expires}`
        }

        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'edwardpbn@gmail.com',
                clientId: process.env.GMAIL_API_CLIENT_ID,
                clientSecret: process.env.GMAIL_API_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_API_REFRESH_TOKEN,
                accessToken
            },
            tls : { rejectUnauthorized: false }
        })

        const mailOptions = {
            from: 'edwardpbn@gmail.com',
            to: addressee,
            subject: 'DOGS APP - Verify your email address',
            text: `Hi ${name}` +
            'Thank so much for wanting to try the DOGS APP deeply' + 
            'In order to avoid spam, we verify all the email addresses so the following link would help us to verify yours' +
            'Please, click it and wait until your logging is completed and do not worry because it is not dangerous' + 
            `<a href="${url}">Verify your email</a>` +
            'Hope you share your pets with the community',
            html: `<div style='background-color: #0d6efd; padding: 16px; border-radius: 5px; color: #fff !important;'><h1 style='margin-top: 0;'>Hi ${name}</h1>` +
            '<p>Thank so much for wanting to try the DOGS APP deeply</p>' +
            '<p>In order to avoid spam, we verify all the email addresses so the following link would help us to verify yours</p>' +
            '<p>Please, click it and wait until your logging is completed, and do not worry because it is not dangerous at all</p>' + 
            `<a style='background-color: #fff; color: #0d6efd; padding: 6px 12px; display: inline-block; text-decoration: none; border-radius: 5px' href="${url}">Verify your email</a>` + 
            `<p style='margin-bottom: 0;'>Hope you share your pets with the community</p></div>`
        }

        const result = await transport.sendMail(mailOptions);
        console.log(result)
        return result;
    } catch (e) {
        console.log(e)
        return 'Sorry, an error ocurred'
    }
}

module.exports.sendMail = sendMail;
