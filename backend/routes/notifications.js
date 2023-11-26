const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const admin = require('firebase-admin');
const {
  usersServiceUrl,
  frontendServiceUrl,
  gatewayServiceUrl,
} = require('../envRoutes');
const port = 3003;
const app = express();
app.use(bodyParser.json());
/*Front end stuff
const firebaseConfig = {
  apiKey: 'AIzaSyBRObQEQeWWw9vI2jxBKTT9ezMvAv2B9Uk',
  authDomain: 'immerse-7a7fa.firebaseapp.com',
  projectId: 'immerse-7a7fa',
  storageBucket: 'immerse-7a7fa.appspot.com',
  messagingSenderId: '269807638089',
  appId: '1:269807638089:web:b47de2727d97c687729198',
};
*/
const serviceAccount = {
  type: 'service_account',
  project_id: 'immerse-7a7fa',
  private_key_id: 'deb8a08ca1d9b4604f8a076d77db546012e5230f',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCocef7s0EKni93\n52BFT90yASk+p131po/N2NHw1UdM15WZKqWa4wfESEtwD8is1pixrqF0DS2Ly2Pb\nT5/PYAqOnbNpRazzVBrm39/YY72HMJsezme+UbpATmeEOEpQ10aP5jBdDTA4EinC\ntBClKaHhQHry0CYyKpRcOloL7VLNoVO/lA+TN+ELiXWRICG1no6fdFPtWZylmouj\nFNt2K8xRUOHRK0Da9a0/HsJHdliderbYT3tBwD+CwB+i3263j5dhvA/pyBfV01b+\nzT4mgCazt000hJAA7g9C/lgG48UHzE7l1izRs2qp1j0iqMJ/WYb00074z5/FwrfL\nPNxMY2gVAgMBAAECggEAEivnmNGnrJuQB2Fgk1mgRSq25llr23pSfSRs0YxQmsuP\nCez93I2tYtFhwf8R6QNliZWLOVfKmBAi/5/BX7++o9ADcNHhbIagOFPidBeedJ0b\nvuEJdBChBRrwM+VWrw3qQM/WW9N2ZjYfZy/Bs++f1Qr9uIAX/sV1J9XrrOm3SxN1\neCq40I46pet404N46q9/AuQ0KLrAubWMbJSK1w5d+Re2PTjbsZQLxy1micBtU4Sz\nFHj6QzrLHuRrYcY7Of4FfogtpHezmS6nEGRpMB7T75ACoy4RkSIm8amCrl9e0qFK\nG9pmbRqrxk733lWQAsg4KjtwLSerdYtyQqwIdIG9QQKBgQDZ8QjbdK5NNgCNirzR\ngJ6bnoUx3Us3u5541iEF/b/QNFX5OmH2zWJCUUwSmcO0f1HgMBDcZ1GeQgggFMiW\nsabr/TgQfj7P7i9lMTOnvCiIlpMX+gBkZ7+OazlMNKAoSlueyoakGY89rwZT8/pv\n9cUCQfDIpKfaKfQ57BEm/DUaiQKBgQDF3CbLt7zOalnOpIodN/Q6d4ML3mqaV53a\nF5TE5qv3NVL+bPYCxvohc8E+X72JisleeOF2p0QuC8we58Hu061zGnFzxgLMCXNq\nRRwZ6JFCx53vvGjp8YroHlyImlrjRpjagK2rEE653vn6zireujy2bx2H+Q7o+jUw\nPBLBYzhOLQKBgCe2eiyzGEfNfVBNZZavXzdwLUkmz9v5/ih6rE3RLTCdOMVPVCaK\nykrXUYtaJYUwZhT57TicQw0Zby2ZW+vJt2btH1gyCPQOrOg9jPIVoTUyat9FmOiy\n1v72ntw6Aq0Uz5khwmMInUdaK0cFAC+Ck0GUDnIhPszMNEqRr5ZxAqQxAoGAc/oi\np4Dw5BGEyNK7vnrA5tCM+RULaaL3/RGbe3s2y7XvCwG1hlU54wfl+vjFseyvMngq\nuJE9LrxtjqQMkkBzyCd03wbvNshHZcBSw4EGPJ2jnxXSbWbPJFY/qTbJFbWY/WM1\n6TKq4tqnrvLQQDPsSIeDSOOdcMTRDo/38nGFXJUCgYAVywaC3qo8Uvr3L0ZJYVC5\nfO1/A2yQfgd3Ru0DA1zr3TMPk2SKhWbiHVJHaAAk2uC8d1TVGU/Vs2YBwy1BDiva\n5hYgE4vjXaj7Cmt5G05ZOzU/QSsoa5THfcMu9q++nURgJduCNluS7TZIfAOoAJDo\nNXO+wp9Bx+Z4gRY/frz/FQ==\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-51lfx@immerse-7a7fa.iam.gserviceaccount.com',
  client_id: '102300243230426594841',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-51lfx%40immerse-7a7fa.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const transporter = nodemailer.createTransport(
  smtpPool({
    pool: true,
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // Set to true if using a secure connection (e.g., SSL)
    auth: {
      user: 'admin@immersechat.online',
      pass: 'Csc400Fall2023',
    },
    tls: {
      rejectUnauthorized: false,
    },
    maxConnections: 10, // Maximum number of simultaneous connections in the pool
  })
);

app.post('/notify', async (req, res) => {
  const eventData = req.body;
  const eventType = eventData.eventType;
  let mailOptions = {
    from: 'admin@immersechat.online',
    to: eventData.email,
  };
  try {
    switch (eventType) {
      case 'contactAdded':
        console.log('ContactAdded Handled' + eventData.message);
        /*push notif: Firebase FCM
        admin
          .messaging()
          .send(eventData.message)
          .then((response) => {
            console.log('ContactAdded Event Pushed:', response);
          })
          .catch((error) => {
            console.error('ContactAdded Event Failed:', error);
          });*/
        break;

      case 'verificationCode':
        //send email
        mailOptions.subject = 'Password Reset Verification Code';
        mailOptions.text = `Your verification code is: ${eventData.verificationCode}`;
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
      //send contact invite

      case 'contactInvitation':
        mailOptions.subject = 'New Contact Invitation!';
        mailOptions.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contact Invitation</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h5>Hi ${eventData.toName},</h5>           
                <p style="font-weight: bold;">You have received a contact invitation from ${eventData.fromName}.</p>
                <table>
                    <tr>
                        <td style="padding: 10px;">
                            <a href="${gatewayServiceUrl}/api/users/accept-contact/${eventData.senderId}/${eventData.receiverId}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Accept</a>
                        </td>
                        <td style="padding: 10px;">
                            <a href="${gatewayServiceUrl}/api/users/refuse-contact/${eventData.senderId}/${eventData.receiverId}" style="display: inline-block; padding: 10px 20px; background-color: #f44336; color: #fff; text-decoration: none; border-radius: 5px;">Refuse</a>
                        </td>
                    </tr>
                </table>
        
                <p>Thank you!</p>
                <p>The Immerse Team.</p>
            </div>
        </body>
        </html>
        `;
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
          } else {
            console.log('Email sent successfully:', eventData);
          }
        });
        break;

      case 'invite-to-app':
        mailOptions.subject = 'Invitation To New Life [Immerse]!';
        mailOptions.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation to Immerse</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
        
                h2 {
                    color: #333;
                }
        
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <p>Hello There,</p>
            <p>${eventData.fromName}, has invited you to join them on the Immerse Chat App.</p>
        
            <a href="${frontendServiceUrl}/register/${eventData.senderId}" class="button">Sign Up Now!</a>
        </body>
        </html>
        `;
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({
              message: 'Error sending email',
            });
          } else {
            console.log('Email sent successfully:', info);
            return res.status(200).json({
              message: 'Email sent successfully',
            });
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
