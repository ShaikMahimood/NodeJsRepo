const Schema = require("validate");
const config = require("../config/app.sepc.json");
const { createRecord, getRecord, deleteRecord } = require("../db/mongodb");
const { Utils } = require("./utils");

const utils = new Utils();

const {  addToken } = require("./token");
//schema for authentication
const authentication = new Schema({
  id: { type: String },
  rectype: { type: String },
  orgid: { type: String }, // user orgid
  refrectype: { type: String, enum: config.user.rectype },
  refid: { type: String, required: true }, // user id
  data: {
    username: {
      type: String,
      length: { min: 3, max: 30 },
      required: true,
    }, //<Username to Login>
    password: { type: String, length: { min: 8, max: 30 }, required: true }, //Store encrypted Password String
  },
});

//validation function is used to validate requested fields with the schema
function validation(params) {
  const {
    refid,
    data: { username, password },
  } = params;

  const authData = {
    refid,
    data: {
      username,
      password,
    },
  };

  //validate the schema with requested data
  let errors = authentication.validate(authData);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors;
  } else {
    return true;
  }
}

//setAuth is used to create user authentication
async function setAuth(payload) {
  try {
    const { refid, refrectype, data } = payload;
    validation(payload);
    data.password = utils.MD5(data.password);

    const userParams = {
      rectype: refrectype,
      id: refid,
      status: config.common.status.active,
    };
    const userData = await getRecord(userParams);
    if (!userData.length) throw "Invalid/InActive user!";

    const { orgid } = userData[0];

    payload.orgid = orgid;
    payload.rectype = config.authentication.rectype;

    const authParams = { rectype: payload.rectype, refid };
    //check if any old record exists for the user.
    const authData = await getRecord(authParams);

    //if user exist then remove that old record and again insert new record
    if (authData.length) {
      const { id } = authData[0];
      const authParams = { rectype: payload.rectype, id };
      await deleteRecord(authParams);
    }

    await createRecord(payload);
    return { message: "authentication Successfull" };
  } catch (error) {
    throw error;
  }
}

//validateAuth is used to login with valid username and password and return the token
async function validateAuth(payload) {
  try {
    const { username, password } = payload;
    payload.rectype = config.authentication.rectype;
    const authParams = {
      rectype: payload.rectype,
      "data.username": username,
      "data.password": utils.MD5(password),
    };
    const authData = await getRecord(authParams);
    if (!authData.length) throw "Invalid username/password";

    const { refrectype, refid } = authData[0];
    const userParams = {
      rectype: refrectype,
      id: refid,
      status: config.common.status.active,
    };
    const userData = await getRecord(userParams);
    if (!userData.length) throw "Invalid/Inactive user!";
    const { id, orgid, firstname, lastname } = userData[0];
    const tokenParams = { id, orgid, firstname, lastname, username };
    const token = utils.jwtToken(tokenParams);
    const tokenRecordparams = { refid, token, refrectype };
    await addToken(tokenRecordparams);
    return token;
  } catch (error) {
    throw error;
  }
}

module.exports = { setAuth, validateAuth };
