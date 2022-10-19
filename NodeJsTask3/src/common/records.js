const Schema = require("validate");
const config = require("../config/app.sepc.json");
const {
  createRecord,
  getRecord
} = require("../db/mongodb");
const { Utils } = require("./utils.js");

const utils = new Utils();

//schema for recordsSchema
const recordsSchema = new Schema({
  id: { type: String },
  rectype: { type: String },
  orgid: { type: String },
  recordsmodelid: {type: String},
  refrectype: { type: String, enum: [config.patient.rectype] },
  refid: { type: String, required: true },
  type: { type: String, enum: config.records.type, required: true },
  data: {},
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
  const { orgid, refid, recordsmodelid, type, date, refrectype } = validateParams;
  const recordparams = {
    orgid,
    refid,
    recordsmodelid,
    refrectype,
    type,
    date,
  };

  //validate the schema with requested data
  let errors = recordsSchema.validate(recordparams);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0].message;
  } else {
    return true;
  }
}

//createRecords function used to call createRecord from mongodb file and get inserted response or error
async function createRecords(req, res) {
  try {
    const { refid, type, recordsmodelid, data } = req.body;
    let payload = { refid, type, recordmodelparams, data };
    payload.refrectype = config.patient.rectype;

    const patientparams = { id: refid, rectype: config.patient.rectype };
    const orgid = await utils.getRecOrgId(patientparams);
    payload.orgid = orgid;

    validation(payload);
    
    const recordmodelparams = {
      rectype: config.recordsmodel.rectype,
      id: recordsmodelid,
    };

    const getmodeldata = await getRecord(recordmodelparams);
    const { type: modeltype, data: modeldata } = getmodeldata[0];
    if (type != modeltype) throw "Enter valid type!";

    const Validdata = utils.getModelData(modeldata, data);
    
    payload.data = Validdata;
    payload.rectype = config.records.rectype;

    const orginfo = await createRecord(payload);
    res.status(200).json({ status: "Success", results: orginfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

module.exports = { createRecords };
