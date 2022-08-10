const config = require("../config/app.sepc.json");
const {
  createRecord,
  getRecord,
  updateRecord,
  deleteRecord,
} = require("../db/mongodb.js");

//createRec function used to call createRecord from mongodb file and get inserted response or error
async function createRec(req, res) {
  try {
    req.body.rectype = config.organization.rectype;
    const orginfo = await createRecord(req.body);
    res.status(200).json({ status: "Success", results: orginfo });
  } catch (error) {
    console.log("Error :" + error);
    res.status(400).json({ status: "Error :", error: error });
  }
}

//getRec function used to call getRecord from mongodb file and get record response or error
async function getRec(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.organization.rectype;

    const data = await getRecord(payload);
    res.status(200).json({ status: "Success", results: data });
  } catch (error) {
    console.log("Error :" + error);
    res.status(400).json({ status: "Error :", error: error });
  }
}

//updateRec function used to call updateRecord from mongodb file and get updated response or error
async function updateRec(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.organization.rectype;
    payload.body = req.body;
    const data = await updateRecord(payload);
    res.status(200).json({ status: "Success", results: data });
  } catch (error) {
    console.log("Error :" + error);
    res.status(400).json({ status: "Error :", error: error });
  }
}

//deleteRec function used to call deleteRecord from mongodb file and get deleted response or error
async function deleteRec(req, res) {
  try {
    const { query } = req;
    const payload = query;
    console.log(payload);
    payload.rectype = config.organization.rectype;

    const data = await deleteRecord(payload);
    res.status(200).json({ status: "Success", results: data });
  } catch (error) {
    console.log("Error :" + error);
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
