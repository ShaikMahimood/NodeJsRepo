const Router = require("express");

const emailvalidator = require("email-validator");

const router = Router();

const emailSend = require("../Services/email.js");

//endpoint for send mail from router (post Method)
router.post("/sendemail", async (req, res) => {
  try {
    if (emailvalidator.validate(req.body.to)) {
      const mailInfo = await emailSend(req.body);
      console.log(mailInfo);
      res.render("success");
    } else {
      res.status(400).send("Invalid Email");
    }
    // passing body parameters to emailSend function to send mail from nodemailer
  } catch {
    res.render("failed");
  }
});

module.exports = router;
