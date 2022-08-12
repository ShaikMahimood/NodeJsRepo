const config = require("../config/app.sepc.json");

const { createRecord, updateRecord, deleteRecord } = require("../db/mongodb");

const { Utils } = require("../common/utils");

const utils = new Utils();

//addcontact function used to call createRecord from mongodb file and get inserted response or error
async function addcontact(req, res) {
  try {
    const {
      body: { refid, refrectype },
    } = req;
    req.body.rectype = config.contact.rectype;
    if (refrectype == config.patient.rectype) {
      const orgparams = { rectype: refrectype, id: refid };
      const orgid = await utils.getRecOrgId(orgparams);
      req.body.orgid = orgid;
    }
    const contactInfo = await createRecord(req.body);
    res.status(200).json({ status: "Success", results: contactInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//updatecontact function used to call updateRecord from mongodb file and get updated response or error
async function updatecontact(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.contact.rectype;
    payload.body = req.body;
    const contactInfo = await updateRecord(payload);
    res.status(200).json({ status: "Success", results: contactInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//removecontact function used to call deleteRecord from mongodb file and get deleted response or error
async function removecontact(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.contact.rectype;
    const contactInfo = await deleteRecord(payload);
    res.status(200).json({ status: "Success", results: contactInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//export all functions

module.exports = {
  addcontact,
  updatecontact,
  removecontact,
};
