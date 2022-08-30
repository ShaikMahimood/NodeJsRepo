const Schema = require("validate");
const config = require("../config/app.sepc.json");

const {
  createRecord,
  updateRecord,
  getRecord,
  deleteRecord,
} = require("../db/mongodb");

const { Utils } = require("./utils");

const utils = new Utils();

//schema for contact
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
    type: String,
    enum: Object.values(config.contact.subtype),
    required: true,
  },
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
  const { refid, refrectype, type, subtype } = validateParams;
  const contactData = {
    refid,
    refrectype,
    type,
    subtype,
  };

  //validate the schema with requested data
  let errors = contactSchema.validate(contactData);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0].message;
  } else {
    return true;
  }
}

//addAddress function used to insert record into database
async function addAddress(contactBody) {
  try {
    const { refid, refrectype, type, subtype, address } = contactBody;
    validation(contactBody);
    const {
      type: contactType,
      subtype: subType,
      rectype: contactRectype,
    } = config.contact;
    if (type != contactType.address)
      throw "Invalid type, Enter address as type!";
    if (![subType.home, subType.work].includes(subtype))
      throw "Invalid Subtype, Enter Subtype either home or work";

    const recordParams = { rectype: refrectype, id: refid, status: config.common.status.active };
    const recordData = await getRecord(recordParams);
    if (!recordData.length) throw "Invalid/InActive record!";

    const addressparams = {
      address,
      checkaddress: config.contact.address,
    };

    //validating address
    utils.validateAddress(addressparams);

    //get orgid from patient record
    if (refrectype == config.patient.rectype) {
      const orgid = await utils.getRecOrgId(recordParams);
      contactBody.orgid = orgid;
    }

    contactBody.rectype = contactRectype;
    const contactInfo = await createRecord(contactBody);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}
//updateAddress function used to update record from database
async function updateAddress(contactBody) {
  try {
    const { id, type, address } = contactBody;
    const { type: contactType, rectype: contactRectype } = config.contact;

    if (type != contactType.address)
      throw "Invalid type, Enter address as type!";
    const addressparams = {
      address,
      checkaddress: config.contact.address,
    };

    //validating address
    utils.validateAddress(addressparams);

    const payload = { id, body: { type, address } };
    payload.rectype = contactRectype;

    const contactInfo = await updateRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//removeAddress function used to delete record from database
async function removeAddress(contactBody) {
  try {
    const payload = contactBody;
    payload.rectype = config.contact.rectype;

    const contactInfo = await deleteRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//addEmail function used to insert record into database
async function addEmail(contactBody) {
  try {
    const { refid, refrectype, type, subtype, email } = contactBody;
    validation(contactBody);
    const { type: contactType, subtype: subType } = config.contact;
    if (type != contactType.email) throw "Invalid type, Enter email as type!";
    if (![subType.primary, subType.secondary].includes(subtype))
      throw "Invalid Subtype, Enter Subtype either primary or secondary";

    //validating the email
    utils.validateEmail(email);

    const recordParams = { rectype: refrectype, id: refid, status: config.common.status.active };
    const recordData = await getRecord(recordParams);
    if (!recordData.length) throw "Invalid/InActive record!";

    //get orgid from patient record
    if (refrectype == config.patient.rectype) {
      const orgid = await utils.getRecOrgId(recordParams);
      contactBody.orgid = orgid;
    }

    contactBody.rectype = config.contact.rectype;
    const contactInfo = await createRecord(contactBody);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}
//updateEmail function used to update record from database
async function updateEmail(contactBody) {
  try {
    const { id, type, email } = contactBody;
    const { type: contactType, rectype: contactRectype } = config.contact;
    if (type != contactType.email) throw "Invalid type, Enter email as type!";

    //validating the email
    utils.validateEmail(email);

    const payload = { id, body: { type, email } };
    payload.rectype = contactRectype;

    const contactInfo = await updateRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//removeEmail function used to delete record from database
async function removeEmail(contactBody) {
  try {
    const payload = contactBody;
    payload.rectype = config.contact.rectype;

    const contactInfo = await deleteRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//addPhone function used to insert record into database
async function addPhone(contactBody) {
  try {
    const { refid, refrectype, type, subtype, phone } = contactBody;
    validation(contactBody);
    const {
      type: contactType,
      subtype: subType,
      rectype: contactRectype,
    } = config.contact;
    if (type != contactType.phone) throw "Invalid type, Enter phone as type!";
    if (![subType.mobile, subType.personal].includes(subtype))
      throw "Invalid Subtype, Enter Subtype either mobile or personal!";

    //validating the Phone
    //utils.validatePhone(phone);

    const recordParams = { rectype: refrectype, id: refid, status: config.common.status.active };
    const recordData = await getRecord(recordParams);
    if (!recordData.length) throw "Invalid/Inactive record!";

    //get orgid from patient record
    if (refrectype == config.patient.rectype) {
      const orgid = await utils.getRecOrgId(recordParams);
      contactBody.orgid = orgid;
    }

    contactBody.rectype = contactRectype;
    const contactInfo = await createRecord(contactBody);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}
//updatePhone function used to update record from database
async function updatePhone(contactBody) {
  try {
    const { id, type, phone } = contactBody;
    const { type: contactType, rectype: contactRectype } = config.contact;
    if (type != contactType.phone) throw "Invalid type, Enter phone as type!";

    //validating the Phone
    utils.validatePhone(phone);

    const payload = { id, body: { type, phone } };
    payload.rectype = contactRectype;

    const contactInfo = await updateRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//removePhone function used to delete record from database
async function removePhone(contactBody) {
  try {
    const payload = contactBody;
    payload.rectype = config.contact.rectype;

    const contactInfo = await deleteRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//addFax function used to insert record into database
async function addFax(contactBody) {
  try {
    const { refid, refrectype, type, subtype, fax } = contactBody;
    validation(contactBody);
    const {
      type: contactType,
      subtype: subType,
      rectype: contactRectype,
    } = config.contact;
    if (type != contactType.fax) throw "Invalid type, Enter fax as type!";
    if (![subType.work, subType.home].includes(subtype))
      throw "Invalid Subtype, Enter Subtype either home or work!";

    //validating the Fax
    utils.validateFax(fax);

    const recordParams = { rectype: refrectype, id: refid, status: config.common.status.active };
    const recordData = await getRecord(recordParams);
    if (!recordData.length) throw "Invalid/InActive record!";

    //get orgid from patient record
    if (refrectype == config.patient.rectype) {
      const orgid = await utils.getRecOrgId(recordParams);
      contactBody.orgid = orgid;
    }

    contactBody.rectype = contactRectype;
    const contactInfo = await createRecord(contactBody);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}
//updateFax function used to update record from database
async function updateFax(contactBody) {
  try {
    const { id, type, fax } = contactBody;
    const { type: contactType, rectype: contactRectype } = config.contact;
    if (type != contactType.fax) throw "Invalid type, Enter fax as type!";

    //validating the Fax
    utils.validateFax(fax);

    const payload = { id, body: { type, fax } };
    payload.rectype = contactRectype;

    const contactInfo = await updateRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//removeFax function used to delete record from database
async function removeFax(contactBody) {
  try {
    const payload = contactBody;
    payload.rectype = config.contact.rectype;

    const contactInfo = await deleteRecord(payload);
    return contactInfo;
  } catch (error) {
    throw error;
  }
}

//processFun function used to valid the action and send valid function
function processFun(__action) {
  const functionMapping = {
    addAddress: addAddress,
    updateAddress: updateAddress,
    removeAddress: removeAddress,
    addEmail: addEmail,
    updateEmail: updateEmail,
    removeEmail: removeEmail,
    addPhone: addPhone,
    updatePhone: updatePhone,
    removePhone: removePhone,
    addFax: addFax,
    updateFax: updateFax,
    removeFax: removeFax,
  };
  if (__action in functionMapping) {
    return functionMapping[__action];
  } else {
    throw "Invalid __action!";
  }
}
module.exports = {
  processFun,
};
