const config = require("../config/app.sepc.json");
const { Utils } = require("../common/utils");

const utils = new Utils();

//validateOffices to validate offices
async function validateOffices(req, res, next) {
  try {
    const {
      body: { orgid },
      session: { id },
    } = req;

    const offices = await utils.getUserOffices(id);

    if (!offices.includes(orgid))
      throw "User Don't have access to create patient and Enter Valid Orgid!";
    next();
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

module.exports = { validateOffices };