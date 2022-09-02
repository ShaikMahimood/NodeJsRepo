const config = require("../config/app.sepc.json");
const { Utils } = require("../common/utils");

const utils = new Utils();

const { getRecord } = require("../db/mongodb");

//verifyUserToken function is used to validate the token and authorize that token
async function verifyUserToken(req, res, next) {
  let token = req.headers.authorization;
  if (!token) return res.status(401).send("Access Denied/Unauthorized request");

  try {
    token = token.split(" ")[1]; // Remove Bearer from string

    if (token === "null" || !token)
      return res.status(401).send("Unauthorized request, Enter Token!");

    const userData = utils.validateToken(token);
    const tokenParams = { rectype: config.token.rectype, refid: userData.id };
    const tokenRecord = await getRecord(tokenParams);
    //verify the token with token record data
    if (tokenRecord.length) {
      const { refid, token: recordToken } = tokenRecord[0];
      if (token != recordToken) throw error;
      const userParams = {
        rectype: config.user.rectype,
        id: refid,
        status: config.common.status.active,
      };
      const userRecord = await getRecord(userParams);
      if (!userRecord.length) throw "Invalid/Inactive record!";
      req.session = userData;
    } else throw error;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
}

module.exports = { verifyUserToken };
