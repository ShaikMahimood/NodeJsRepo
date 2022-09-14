const Schema = require("validate");
const config = require("../config/app.sepc.json");
const { createRecord, getRecord, deleteRecord } = require("../db/mongodb");
//schema for token
const tokenSchema = new Schema({
  id: { type: String },
  rectype: { type: String }, //token
  refrectype: { type: String, enum: config.user.rectype, required: true },
  refid: { type: String, required: true }, //user id
  token: { type: String, required: true },
});

//validation function is used to validate requested fields with the schema
function Validation(params) {
  const { refid, token, refrectype } = params;

  //check validate conditions and send next() otherwise send error
  let errors = tokenSchema.validate(params);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0].message;
  } else {
    return true;
  }
}

//addToken used to add token record into token table
async function addToken(payload) {
  try {
    const { refid, refrectype, token } = payload;
    Validation(payload);
    payload.rectype = config.token.rectype;
    // remove existing tokens
    const tokenParams = { rectype: payload.rectype, refid };
    //check if any old record exists for the user.
    const tokenData = await getRecord(tokenParams);

    //if user exist then remove that old record and again insert new record
    if (tokenData.length) {
      const { id } = tokenData[0];
      const tokenParams = { rectype: payload.rectype, id };
      await deleteRecord(tokenParams);
    }
    // generate a new record
    await createRecord(payload);
    return { message: "Token Record Created Successfull" };
  } catch (error) {
    throw error;
  }
}

//deleteToken used to deleted the token record from token table
async function deleteToken(payload) {
  try {
    const { refid } = payload;
    payload.rectype = config.token.rectype;
    const tokenParams = { rectype: payload.rectype, refid };
    //check if any old record exists for the user.
    const tokenData = await getRecord(tokenParams);

    //if user exist then remove that old record and again insert new record
    if (tokenData.length) {
      const { id } = tokenData[0];
      const tokenParams = { rectype: payload.rectype, id };
      await deleteRecord(tokenParams);
      return { message: "Token Record Data deleted!" };
    }
    return { message: "Token Record Not Found!" };
  } catch (error) {
    throw error;
  }
}

module.exports = { addToken, deleteToken };
