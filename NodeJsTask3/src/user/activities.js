const Schema = require("validate");
const config = require("../config/app.sepc.json");
const { createRecord } = require("../db/mongodb");

//schema for activities
const activitiesSchema = new Schema({
  id: { type: String },
  rectype: { type: String }, //activitylog
  orgid: { type: String }, // organization Id
  userid: { type: String, required: true },
  path: { type: String, required: true },
  method: { type: String, required: true },
  token: { type: String, required: true },
  __action: { type: String },
  payload: { type: String },
  dateCreated: { type: String },
  resid: { type: String },
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
  const { userid, path, method, token } = validateParams;
  const activityparams = {
    userid,
    path,
    method,
    token,
  };

  //validate the schema with requested data
  let errors = activitiesSchema.validate(activityparams);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0];
  } else {
    return true;
  }
}

async function createActivities(req, res, next) {
  try {
   
    const {
      headers: { authorization },
      method,
      originalUrl,
      body,
      session,
    } = req;
    const { id, orgid } = session;
    const token = authorization.split(" ")[1];
    let activitypayload = {
      userid: id,
      orgid,
      path: originalUrl,
      method,
      token,
      payload: body, 
      rectype: config.activitylog.rectype,
    };
    if (body.__action) {
      activitypayload.payload = body.body;
      activitypayload.__action = body.__action;
    }
    validation(activitypayload);
    const activityInfo = await createRecord(activitypayload);
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "Error :", error: error.message });
  }
}

module.exports = { createActivities };
