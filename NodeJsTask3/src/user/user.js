const Schema = require("validate");
const config = require('../config/app.sepc.json');

//schema for user
const user = new Schema({
    id: { type: String },
    rectype: { type: String },
    orgid: { type: String }, // organization Id
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, enum: config.common.gender, required: true },
    dob: { type: String, required: true },
    status: { type: String, enum: [config.common.status.active, config.common.status.inactive] },
    created: { type: String },
    data: {}
});

//validation function is used to validate requested fields with the schema
function Validation(req, res, next) {
    const {
      body: {
        firstname,
        lastname,
        gender,
        dob,
        status,
        data,
      }
    } = req;
  
    const userData = {
      firstname,
      lastname,
      gender,
      dob,
      status,
      data,
    };
  
    //check validate conditions and send next() otherwise send error
    let errors = user.validate(userData);
    if (errors.length) {
      errors = errors.map((eRec) => {
        return { path: eRec.path, message: eRec.message };
      });
      res.send(errors);
    } else {
      next();
    }
  }
  
  module.exports = { Validation};