const Schema = require("validate");

const patient = new Schema({
  rectype: { type: String, required: true }, // patient
  orgid: { type: Number},
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  nickname: { type: String},
  gender: { type: String, enum: ["male", "female", "others"], required: true },
  dob: { type: String, required: true },
  mrn: { type: String },
  ssn: { type: String },
  language: {
    type: String,
    enum: ["english", "urdu", "hindi", "telugu", "japan"], 
    required: true 
  },
  status: { type: String, enum: ["active", "inactive"], required: true  },
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
  req.data = patientData;
  //req.data = patientData.created;
  //check validate conditions and send next() otherwise send error
  const error = patient.validate(patientData);
  console.log(error);
  if (error == null || error.length === 0) {
    next();
  } else {
    console.log("error");
    res.send("error");
  }
}

module.exports = { patient, Validation};
