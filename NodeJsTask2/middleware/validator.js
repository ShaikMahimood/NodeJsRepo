const emailvalidator = require("email-validator");

//emailValidation function is used to validate the email
function emailValidation(req, res, next) {
  const {
    body: { to },
  } = req;
  //check validate condition email and send next() otherwise navigate to failed page
  if (emailvalidator.validate(to)) {
    next();
  } else {
    res.render("failed");
  }
}

module.exports = { emailValidation };
