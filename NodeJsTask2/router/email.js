const Router = require("express");
const router = Router();
const emailSend = require("../Services/email.js");
const { emailValidation } = require("../middleware/validator.js");
//endpoint for send mail from router (post Method)
router.post("/sendemail", emailValidation, async (req, res) => {
  try {
    const mailInfo = await emailSend(req.body);
   // console.log(mailInfo);
    res.render("success");
  } catch {
    // passing body parameters to emailSend function to send mail from nodemailer
    res.render("failed");
  }
});

module.exports = router;
