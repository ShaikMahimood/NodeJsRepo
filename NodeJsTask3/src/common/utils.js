const fs = require("fs");
const config = require("../config/app.sepc.json");
const emailvalidator = require("email-validator");
const validatePhoneNumber = new RegExp(config.contact.phonenumberreqex);
const validateFax = new RegExp(config.contact.faxregex);

class Utils {
  getCurrentDateTime() {
    return new Date().toISOString();
  }

  getFileContent(path) {
    // Read content from the file
    const fileContent = fs.readFileSync(path);
    return fileContent;
  }

  async getRecOrgId(params) {
    const { getRecord } = require("../db/mongodb.js");
    const { id, rectype } = params;
    const orgInfo = await getRecord({ id, rectype });
    if (!orgInfo.length) {
      throw `Invalid ${rectype} Id`;
    }
    return orgInfo[0].orgid;
  }

  async getFileOriginalname(params) {
    const { getRecord } = require("../db/mongodb.js");
    const { id, rectype } = params;
    const orgInfo = await getRecord({ id, rectype });
    if (!orgInfo.length) {
      throw `Invalid ${rectype} Id`;
    }
    return orgInfo[0].originalname;
  }
  //validateAddress function is used validate the address
  async validateAddress(params) {
    const { address, checkaddress } = params;
    await checkaddress.forEach((element) => {
      if (!address.hasOwnProperty(element)) {
        throw "address mustbe in a format like line1, line2, city, state, zip";
      }
    });
    return true;
  }

  //emailValidation function is used to validate the email
  async validateEmail(email) {
    if (!emailvalidator.validate(email)) throw "Enter Valid email Id!";
    else return true;
  }

  //validatePhone function is used to validate the phone
  async validatePhone(phone) {
    if (!validatePhoneNumber.test(phone)) throw "Enter Valid Phone Number!";
    else return true;
  }

  //validateFax function is used to validate the fax
  async validateFax(fax) {
    if (!validateFax.test(fax)) throw "Enter Valid Fax!";
    else return true;
  }
}

module.exports = { Utils };
