const Schema = require("validate");
const config = require("../config/app.sepc.json");
const emailValidator = require("email-validator");
const phoneNumberValidator = require("validate-phone-number-node-js");

const contactSchema = new Schema({
  id: { type: String },
  rectype: { type: String },
  orgid: { type: String }, // patientorgid or organizationid
  refrectype: {
    type: String,
    enum: [config.patient.rectype, config.organization.rectype],
    required: true,
  },
  refid: { type: String, required: true }, // patientid or organizationid
  type: {
    type: String,
    enum: Object.values(config.contact.type),
    required: true,
  },
  subtype: {
    type: String, required: true,
  },
  data:{
  }
});

function validation(req, res, next) {
  const {
    body: { refid, refrectype, type, subtype, data },
  } = req;

  const contactData = {
    refid,
    refrectype,
    type,
    subtype,
  };

  //check validate conditions and send next() otherwise send error
  let errors = contactSchema.validate(contactData);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    res.send(errors);
  } else {
    next();
  }
}

module.exports = { validation };
