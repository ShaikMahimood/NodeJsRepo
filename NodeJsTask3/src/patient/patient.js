const Schema = require("validate");
const config = require('../config/app.sepc.json');

const patient = new Schema({
  rectype: { type: String}, // patient
  orgid: { type: String},
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  nickname: { type: String},
  gender: { type: String, enum: config.patient.gender, required: true },
  dob: { type: String, required: true },
  mrn: { type: String },
  ssn: { type: String },
  language: {
    type: String,
    enum: config.patient.language, 
    required: true 
  },
  status: { type: String, enum: config.common.status },
  inactivereason: { type: String},
  dateinactivate: { type: String },
  created: { type: Date },
});


function Validation(req, res, next) {
  const {
    body: {
      rectype,
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
      data,
    }
  } = req;

  const patientData = {
    rectype,
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

module.exports = { patient, Validation};
