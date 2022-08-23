const fs = require("fs");
const config = require("../config/app.sepc.json");
const emailvalidator = require("email-validator");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

const validatePhoneNumber = new RegExp(config.contact.phonenumberreqex);
const validatefax = new RegExp(config.contact.faxregex);
const validatedob = new RegExp(config.common.dobreqex);

class Utils {
  //getCurrentDateTime function used to get current datetime
  getCurrentDateTime() {
    return new Date().toISOString();
  }

  //getFileContent function used to get content og the file
  getFileContent(path) {
    // Read content from the file
    const fileContent = fs.readFileSync(path);
    return fileContent;
  }

  //getRecOrgId function used to get orgid from the valid record
  async getRecOrgId(params) {
    const { getRecord } = require("../db/mongodb.js");
    const { id, rectype } = params;
    const orgInfo = await getRecord({ id, rectype });
    if (!orgInfo.length) throw `Invalid ${rectype} Id`;
    return orgInfo[0].orgid;
  }

  //getFileOriginalname function used to get file original name
  async getFileOriginalname(params) {
    const { getRecord } = require("../db/mongodb.js");
    const { id, rectype } = params;
    const orgInfo = await getRecord({ id, rectype });
    if (!orgInfo.length) throw `Invalid ${rectype} Id`;
    return orgInfo[0].originalname;
  }

  //validateDob function is used validate the dateofbirth
  validateDob(dateofbirth) {
    if (!validatedob.test(dateofbirth))
      throw "Enter valid dateofbirth like YYYY-MM-DD format!";
    return true;
  }

  //validateAddress function is used validate the address
  validateAddress(params) {
    const { address, checkaddress } = params;
    checkaddress.forEach((element) => {
      if (!address.hasOwnProperty(element))
        throw "address mustbe in a format like line1, line2, city, state, zip";
    });
    return true;
  }

  //emailValidation function is used to validate the email
  validateEmail(email) {
    if (!emailvalidator.validate(email)) throw "Enter Valid email Id!";
    else return true;
  }

  //validatePhone function is used to validate the phone
  validatePhone(phone) {
    if (!validatePhoneNumber.test(phone)) throw "Enter Valid Phone Number!";
    else return true;
  }

  //validateFax function is used to validate the fax
  validateFax(fax) {
    if (!validatefax.test(fax)) throw "Enter Valid Fax!";
    else return true;
  }

  //MD5 is used to convert tesyt into hash code
  MD5(text) {
    return md5(text);
  }

  jwtToken(params) {
    const token = jwt.sign({ data: params }, config.jwt.secreteKey, {
      expiresIn: config.jwt.expiresTime,
    });
    return token;
  }

  validateToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secreteKey);
      return decoded;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Utils };
