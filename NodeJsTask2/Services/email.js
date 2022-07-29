const nodemailer = require("nodemailer");
const config = require("../config.js");

//emailSend function is used to take pramas as input and sending email from nodemailer with proper trasnsporter
function emailSend(params) {
  const { service, port, secure, requireTLS, auth } = config; //passing config parameters to an object
  const { to, subject, text } = params; // passing input parameters to an object

  //creating a transporter with nodemailer create transport function require parameters
  const transporter = nodemailer.createTransport({
    service,
    port,
    secure,
    requireTLS,
    auth,
  });
  //create mailoptions to send as input for sendMail function
  const mailOptions = {
    from: config.auth.user,
    to,
    subject,
    text,
  };
  console.log(mailOptions);
  //sendMail function is used take mailOptions as input and sending email from nodemailer transporter
  const mail = new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) reject(error);
      else resolve(info);
    });
  });
  return mail;
}

module.exports = emailSend;
