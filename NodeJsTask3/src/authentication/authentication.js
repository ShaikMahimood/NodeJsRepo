const Schema = require("validate");
const config = require("../config/app.sepc.json");

const { createRecord, getRecord, deleteRecord } = require("../db/mongodb");
const { Utils } = require("../common/utils");

const utils = new Utils();

//schema for authentication
const authentication = new Schema({
  id: { type: String },
  rectype: { type: String },
  orgid: { type: String }, // user orgid
  refrectype: { type: String, enum: config.user.rectype },
  refid: { type: String, required: true }, // user id
  data: {
    username: { type: String }, //<Username to Login>
    password: { type: String }, //Store encrypted Password String
    required: true,
  },
});

//validation function is used to validate requested fields with the schema
async function validation(params) {
  const { refid, username, password } = params;

  const authData = {
    refid,
    username,
    password,
  };

  //validate the schema with requested data
  let errors = authentication.validate(authData);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0].message;
  } else {
    return true;
  }
}

async function setAuth(payload) {
  try {
    const { refid, refrectype, data } = payload;
    await validation(payload);
    data.password = await utils.encryptedPassword(data.password);
    const recparams = { rectype: refrectype, id: refid };
    await getRecord(recparams);

    //get orgid from patient record
    if (refrectype == config.user.rectype) {
      const orgid = await utils.getRecOrgId(recparams);
      payload.orgid = orgid;
    }

    payload.rectype = config.authentication.rectype;

    const params = { rectype: payload.rectype, refid };
    //check if any old record exists for the user. 
    const recordInfo = await getRecord(params);

    //if user exist then remove that old record and again insert new record
    if(recordInfo[0] || recordInfo.false){
        const params = { rectype: recordInfo[0].rectype, id: recordInfo[0].id };
        await deleteRecord(params);
    }

    const authInfo = await createRecord(payload);
    return authInfo;
  } catch (error) {
    throw error;
  }
}

module.exports = { setAuth };
