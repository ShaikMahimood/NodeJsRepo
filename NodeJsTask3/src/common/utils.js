const fs = require("fs");
const config = require("../config/app.sepc.json");
const emailvalidator = require("email-validator");
const bcrypt = require("bcrypt");

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
  async validateDob(dateofbirth) {
    if (!validatedob.test(dateofbirth))
      throw "Enter valid dateofbirth like YYYY-MM-DD format!";
    return true;
  }

  //validateAddress function is used validate the address
  async validateAddress(params) {
    const { address, checkaddress } = params;
    await checkaddress.forEach((element) => {
      if (!address.hasOwnProperty(element))
        throw "address mustbe in a format like line1, line2, city, state, zip";
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
    if (!validatefax.test(fax)) throw "Enter Valid Fax!";
    else return true;
  }

  //generate encryptedPassword using bcrypt hash
  async encryptedPassword(password) {
    const saltRounds = 10;
    if(!password) throw "Enter Password";
    return new Promise(async (resolve, reject) => {
      try {
        bcrypt.hash(password, saltRounds, function (error, hash) {
          if (error) reject(error);
          resolve(hash);
        });
      } catch (error) {
        
        throw error;
      }
    });
  }
}

module.exports = { Utils };
