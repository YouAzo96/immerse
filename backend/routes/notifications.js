const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const port = 3003;
const app = express();
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587, // Port for secure SMTP (STARTTLS)
  secure: false, // Use STARTTLS
  auth: {
    user: 'admin@immersechat.online', // Your Outlook email address
    pass: 'Csc400Fall2023', // Your Outlook password
  },
});

app.post('/notify', async (req, res) => {
  const eventData = req.body;
  const eventType = req.body.eventType;
  let mailOptions = {
    from: 'admin@immersechat.online',
    to: req.body.email,
    //subject: 'Password Reset Verification Code',
    // text: `Your verification code is: ${req.body.verificationCode}`,
  };
  try {
    switch (eventType) {
      case 'contactAdded':
        //push notif
        break;
      case 'verificationCode':
        //send email
        mailOptions.subject = 'Password Reset Verification Code';
        mailOptions.text = `Your verification code is: ${req.body.verificationCode}`;
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
          } else {
            console.log('Email sent successfully:', info);
          }
        });
        break;
      case 'userRegistered':
        mailOptions.subject = 'Welcome To Immerse!';
        mailOptions.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Immerse Welcome Email</title>
        </head>
        <body>
            <p>
                Welcome to immerse!<br>
                We're delighted to have you on board.<br><br>
                Your account has been successfully created.<br>
                Enjoy exploring and making the most of our services.<br>
                Sincerely,<br>
                The Immerse Team
            </p>
        </body>
        </html>
        `;

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
          } else {
            console.log('Email sent successfully:', info);
          }
        });
        break;

      case 'passwordChanged':
        mailOptions.subject = 'Password Changed!';
        mailOptions.html = `Your password was changed.\n
                           If you have not performed this action, please <a href="mailto:admin@immersechat.online">contact us</a> and <a href="http://immersechat.online/forget-password">reset your password</a>\n
                           The Immerse Team.`;
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
          } else {
            console.log('Email sent successfully:', info);
          }
        });
        break;

      default:
        break;
    }
    console.log(`${eventType} event received and handled successfully`);
  } catch (error) {
    console.log(`Failed to handle ${eventType} event: ${error}`);
  }
});

app.listen(port, () =>
  console.log(`Notifications microservice listening on port ${port}`)
);
