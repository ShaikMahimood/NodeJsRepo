const Schema = require("validate");
const config = require('../config/app.sepc.json');

//schema for organization
const officeSchema = new Schema({
  rectype: {
    type: String,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: config.organization.type,
    required: true,
  },
  status: {
    type: String,
    enum: [config.common.status.active, config.common.status.inactive ],
    required: true,
  },

  inactivereason: {
    type: String,
  },

  created: {
    type: Date,
    default: Date.now,
  },
  data: {},
});

//validation function is used to validate requested fields with the schema
function Validation(req, res, next) {
  const {
    body: { code, type, status, inactivereason, created, date },
  } = req;

  const officeData = {
    code,
    type,
    status,
    inactivereason,
    created,
    date,
  };
  //check validate conditions and send next() otherwise send error
  let errors = officeSchema.validate(officeData);
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