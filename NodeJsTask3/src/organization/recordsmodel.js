const Schema = require("validate");
const config = require("../config/app.sepc.json");
const { createRecord, getRecord } = require("../db/mongodb.js");

//schema for organization
const recordsmodelSchema = new Schema({
  id: { type: String },
  rectype: { type: String },
  orgid: { type: String, required: true },
  refrectype: { type: String, enum: [config.organization.rectype] },
  type: { type: String, enum: config.recordsmodel.type, required: true },
  data: {},
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
  const { orgid, type, date, refrectype } = validateParams;
  const modelparams = {
    orgid,
    type,
    date,
    refrectype
  };

  //validate the schema with requested data
  let errors = recordsmodelSchema.validate(modelparams);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0].message;
  } else {
    return true;
  }
}

async function createRecordsModel(req, res) {
  try {
    const { orgid, type, date } = req.body;
    req.body.refrectype = config.organization.rectype;
    validation(req.body);
    const orgParams = {
      rectype: req.body.refrectype,
      id: orgid,
      status: config.common.status.active,
    };
    const orgData = await getRecord(orgParams);
    if (!orgData.length) throw "Invalid/Inactive record!";

    req.body.rectype = config.recordsmodel.rectype;
    const orginfo = await createRecord(req.body);
    res.status(200).json({ status: "Success", results: orginfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error.message });
  }
}

module.exports = { createRecordsModel };
