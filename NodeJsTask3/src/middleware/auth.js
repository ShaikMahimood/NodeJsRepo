const config = require("../config/app.sepc.json");
const { Utils } = require("../common/utils");

const utils = new Utils();

function verifyUserToken(req, res, next) {
  let token = req.headers.authorization;
  if (!token)
    return res.status(401).send("Access Denied/Unauthorized request");

  try {
    token = token.split(" ")[1]; // Remove Bearer from string

    if (token === "null" || !token)
      return res.status(401).send("Unauthorized request, Enter Token!");

    utils.validateToken(token);
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};

module.exports = { verifyUserToken };
