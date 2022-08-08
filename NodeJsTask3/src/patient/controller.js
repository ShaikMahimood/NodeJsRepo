const config = require('../config/app.sepc.json');
const {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecord,
} = require("../common/mongodb");

async function createRec(req, res) {
  try {
    req.body.rectype = config.rectype.patient;
    const patientInfo = await createRecord(req.body);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(200).json({ status: "Error :", error: error });
  }
}

async function getRec(req, res) {
  try {
    const { query } = req;
    if (query.id) {
      query.id = parseInt(query.id);
    }
    const payload = query;
    console.log(payload);
    payload.rectype = config.rectype.patient;
    const patientInfo = await getRecord(payload);
    console.log(patientInfo);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(200).json({ status: "Error :", error: error });
  }
}

async function updateRec(req, res) {
  try {
    const { query } = req;
    if (query.id) {
      query.id = parseInt(query.id);
    }
    const payload = query;
    payload.rectype = config.rectype.patient;
    payload.body = req.body;
    const patientInfo = await updateRecord(payload);
    console.log(patientInfo);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(200).json({ status: "Error :", error: error });
  }
}

async function deleteRec(req, res) {
  try {
    const { query } = req;
    if (query.id) {
      query.id = parseInt(query.id);
    }

    const payload = query;
    console.log(payload);
    payload.rectype = config.rectype.patient;
    const patientInfo = await deleteRecord(payload);
    console.log(patientInfo);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(200).json({ status: "Error :", error: error });
  }
}

module.exports = {
  createRec,
  getRec,
  updateRec,
  deleteRec,
};
