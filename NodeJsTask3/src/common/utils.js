const fs = require("fs");

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
  validateAddress(params) {
    const { address, checkaddress } = params;
    checkaddress.forEach((element) => {
      if (!address.hasOwnProperty(element)) {
        throw "address mustbe in a format like line1, line2, city, state, zip";
      }
    });
    return true;
  }
}

module.exports = { Utils };
