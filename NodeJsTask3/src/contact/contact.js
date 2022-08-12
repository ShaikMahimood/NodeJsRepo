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
    enum: [
      config.contact.type.address,
      config.contact.type.email,
      config.contact.type.phone,
      config.contact.type.fax,
    ],
    required: true,
  },
  subtype: {
    type: String,
  },
});

const addressSchema = new Schema({
  subtype: {
    type: String,
    enum: [config.contact.subtype.home, config.contact.subtype.work],
    required: true,
  },
  data: {
    line1: {
      type: String,
      required: true,
    },
    line2: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      match: /^[0-9]+$/,
      required: true,
    },
  },
});

const emailSchema = new Schema({
  subtype: {
    type: String,
    enum: [config.contact.subtype.primary, config.contact.subtype.secondary],
    required: true,
  },
  data: {
    required: true,
  },
});

const faxSchema = new Schema({
  subtype: {
    type: String,
    enum: [config.contact.subtype.home, config.contact.subtype.work],
    required: true,
  },
  data: { required: true},
});

const phoneSchema = new Schema({
  subtype: {
    type: String,
    enum: [config.contact.subtype.mobile, config.contact.subtype.personal],
    required: true,
  },
  data: {},
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
  if (!errors.length) {
    if (type == config.contact.type.address) {
      contactData.data = data;
      errors = addressSchema.validate(contactData);
    } else if (type == config.contact.type.email) {
      if (emailValidator.validate(data)) {
        contactData.data = data;
        errors = emailSchema.validate(contactData);
      } else {
        res.send("Enter valid email id!");
      }
    } else if (type == config.contact.type.phone) {
      if (phoneNumberValidator.validate(data)) {
        contactData.data = data;
        errors = phoneSchema.validate(contactData);
      } else {
        res.send("Enter valid phone number!");
      }
    } else if (type == config.contact.type.fax) {
      contactData.data = data;
      errors = faxSchema.validate(contactData);
    }
  }
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
