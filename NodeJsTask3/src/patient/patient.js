const Schema = require("validate");
const config = require("../config/app.sepc.json");

//schema for patient
const patient = new Schema({
  rectype: { type: String }, // patient
  orgid: { type: String },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  nickname: { type: String },
  gender: { type: String, enum: config.common.gender, required: true },
  dob: { type: String, required: true },
  mrn: { type: String },
  ssn: { type: String },
  language: {
    type: String,
    enum: config.patient.language,
  },
  status: {
    type: String,
    enum: [config.common.status.active, config.common.status.inactive],
  },
  inactivereason: { type: String },
  dateinactivate: { type: String },
  created: { type: Date },
  createdBy: { type: String },
});

//validation function is used to validate requested fields with the schema
function Validation(req, res, next) {
  const {
    body: {
      firstname,
      lastname,
      nickname,
      gender,
      dob,
      mrn,
      ssn,
      language,
      status,
      inactivereason,
      dateinactivate,
      createdBy,
      data,
    },
  } = req;

  const patientData = {
    firstname,
    lastname,
    nickname,
    gender,
    dob,
    mrn,
    ssn,
    language,
    status,
    inactivereason,
    dateinactivate,
    createdBy,
    data,
  };

  //check validate conditions and send next() otherwise send error
  let errors = patient.validate(patientData);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    res.send(errors);
  } else {
    next();
  }
}

module.exports = { Validation };
