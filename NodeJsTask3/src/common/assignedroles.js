const Schema = require("validate");
const config = require("../config/app.sepc.json");

const {
  createRecord,
  updateRecord,
  getRecord,
  deleteRecord,
} = require("../db/mongodb");

//schema for contact
const rolesSchema = new Schema({
  id: { type: String },
  roleid: { type: Array, required: true },
  rectype: { type: String },
  orgid: { type: String }, // organizationid
  refrectype: {
    type: String,
    enum: config.user.rectype,
    required: true
  },
  refid: { type: String, required: true }, // userid
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
  const { roleid, refid, refrectype } = validateParams;
  const rolesData = {
    roleid,
    refid,
    refrectype,
  };

  //validate the schema with requested data
  let errors = rolesSchema.validate(rolesData);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors;
  } else {
    return true;
  }
}

//assignRoles function used to assign roles to different users
async function assignRoles(payload) {
  try {
    const { roleid, refid, refrectype } = payload;
    validation(payload);
    const userParams = {
      rectype: refrectype,
      id: refid,
      status: config.common.status.active,
    };
    const userData = await getRecord(userParams);
    if (!userData.length) throw "Invalid/Inactive user!";

    const { orgid } = userData[0];

    payload.orgid = orgid;
    payload.rectype = config.assignedroles.rectype;
    const roleInfo = await createRecord(payload);
    return roleInfo;
  } catch (error) {
    throw error;
  }
}

//updateRoles function used to update roles for users
async function updateRoles(payload) {
  try {
    const { id, roleid } = payload;
    payload = { id, body:{ roleid }};
    payload.rectype = config.assignedroles.rectype;
    const roleInfo = await updateRecord(payload);
    return roleInfo;
  } catch (error) {
    throw error;
  }
}

//removeRoles function used to remove roles for users
async function removeRoles(payload) {
  try {
    payload.rectype = config.assignedroles.rectype;
    const roleInfo = await deleteRecord(payload);
    return roleInfo;
  } catch (error) {
    throw error;
  }
}

//processFun function used to valid the action and send valid function
function processFun(__action) {
  const functionMapping = {
    assignRoles: assignRoles,
    updateRoles: updateRoles,
    removeRoles: removeRoles,
  };
  if (__action in functionMapping) {
    return functionMapping[__action];
  } else {
    throw "Invalid __action!";
  }
}

module.exports = { processFun };
