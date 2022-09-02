const config = require("../config/app.sepc.json");
const {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecord,
} = require("../db/mongodb");

const { Utils } = require("../common/utils");

const utils = new Utils();

//createRec function used to call createRecord from mongodb file and get inserted response or error
async function createRec(req, res) {
  try {
    const {
      body: { orgid, dob },
    } = req;

    const recordParams = { rectype: config.organization.rectype, id: orgid, status: config.common.status.active };
    const recordData = await getRecord(recordParams);
    if (!recordData.length) throw "Invalid/InActive record!";

    utils.validateDob(dob);

    req.body.rectype = config.user.rectype;
    const userInfo = await createRecord(req.body);
    res.status(200).json({ status: "Success", results: userInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//getRec function used to call getRecord from mongodb file and get record response or error
async function getRec(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.user.rectype;

    const userInfo = await getRecord(payload);
    res.status(200).json({ status: "Success", results: userInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//updateRec function used to call updateRecord from mongodb file and get updated response or error
async function updateRec(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.user.rectype;
    payload.body = req.body;

    const userInfo = await updateRecord(payload);
    res.status(200).json({ status: "Success", results: userInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//deleteRec function used to call deleteRecord from mongodb file and get deleted response or error
async function deleteRec(req, res) {
  try {
    const { query:{ id } } = req;
    const payload = id;
    payload.rectype = config.user.rectype;
    
    const userInfo = await deleteRecord(payload);
    res.status(200).json({ status: "Success", results: userInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//export all functions
module.exports = {
  createRec,
  getRec,
  updateRec,
  deleteRec,
};
