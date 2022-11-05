const fs = require("fs");
const config = require("../config/app.sepc.json");
const emailvalidator = require("email-validator");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

const validatefax = new RegExp(config.contact.faxregex);
const validatedob = new RegExp(config.common.dobreqex);

const { getRecord } = require("../db/mongodb.js");

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
    const orgInfo = await getRecord({ rectype, id });
    if (!orgInfo.length) throw `Invalid ${rectype} Id`;
    return orgInfo[0].orgid;
  }

  //getFileOriginalname function used to get file original name
  async getFileOriginalname(params) {
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

  //validateFax function is used to validate the fax
  validateFax(fax) {
    if (!validatefax.test(fax)) throw "Enter Valid Fax!";
    else return true;
  }

  //MD5 is used to convert tesyt into hash code
  MD5(text) {
    return md5(text);
  }

  //generate token with json web token
  jwtToken(params) {
    const token = jwt.sign(params, config.jwt.secreteKey, {
      expiresIn: config.jwt.expiresTime,
    });
    return token;
  }

  //validate json web token
  validateToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secreteKey);
      return decoded;
    } catch (error) {
      throw error;
    }
  }

  //get model data from recordsmodeldata
  getModelData(recordsmodeldata, recordsdata) {
    let data = {};
    Object.keys(recordsmodeldata).forEach((element) => {
      if (recordsdata.hasOwnProperty(element))
        data[element] = recordsdata[element];
    });
    return data;
  }

  //getUserOffices to get user offices
  async getUserOffices(id) {
    try {
      const officeParams = { rectype: config.user.rectype, id };
      const getOfficeRecord = await getRecord(officeParams);
      return getOfficeRecord[0].offices;
    } catch (error) {
      throw error;
    }
  }

  //checkingDeviceData to check record values with given value
  checkingDeviceData(params) {
    const { min, max, value } = params;
    if (Number(value) < Number(min) || Number(value) > Number(max)) {
      return true;
    }
    return false;
  }

  //get flag, limitDiff, otherdata from min, max and value
  getFlagLimitDiffAndOtherdata(params) {
    const { min, max, value } = params;
    const data = {};
    if (Number(value) < Number(min)) {
      data.flag = "Below Minimum";
      data.limitDiff = min - value;
    } else {
      data.flag = "Over Maximum";
      data.limitDiff = value - max;
    }
    data.otherdata = {
      actualvalue: value,
      min,
      max,
    };
    return data;
  }
}

module.exports = { Utils };
