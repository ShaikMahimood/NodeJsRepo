const Schema = require("validate");
const config = require("../config/app.sepc.json");
const emailValidator = require("email-validator");

const {
  createRecord,
  updateRecord,
  getRecord,
  deleteRecord,
} = require("../db/mongodb");

const { Utils } = require("../common/utils");

const utils = new Utils();

//to validate phone number and fax by using regular expressions
const validatePhoneNumber = new RegExp(config.contact.phonenumberreqex);
const validateFax = new RegExp(config.contact.faxregex);
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
//validation function is used to validate required fields and type of fields
function validation(validateParams) {
  const { refid, refrectype, type, subtype } = validateParams;
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
    throw errors[0].message;
  } else {
    return true;
  }
}
//addAddress function used to call createRecord from mongodb file and get inserted response or error
async function addAddress(contactBody) {
  try {
    const { refid, refrectype, type, subtype, address } = contactBody;
    if (validation(contactBody)) {
      if (type == config.contact.type.address) {
        if (
          subtype != config.contact.subtype.home &&
          subtype != config.contact.subtype.work
        ) {
          throw "Invalid Subtype, Enter Subtype either home or work";
        }
        const recparams = { rectype: refrectype, id: refid };
        await getRecord(recparams);
        const addressparams = {
          address,
          checkaddress: config.contact.address,
        };
        //checkaddress is used to check if request address is in correct format or not
        if (utils.validateAddress(addressparams)) {
          //check if refrectype is patient or not, if patient then find orgid by patient id(refid)
          if (refrectype == config.patient.rectype) {
            const orgparams = { rectype: refrectype, id: refid };
            const orgid = await utils.getRecOrgId(orgparams);
            contactBody.orgid = orgid;
          }
          contactBody.rectype = config.contact.rectype;
          const contactInfo = await createRecord(contactBody);
          return contactInfo;
        }
      } else {
        throw "Invalid type, Enter address as type!";
      }
    }
  } catch (error) {
    throw error;
  }
}
//updateAddress function used to call updateRecord from mongodb file and get updated response or error
async function updateAddress(contactBody) {
  try {
    const { id, type, address } = contactBody;
    if (type == config.contact.type.address) {
      const addressparams = {
        address,
        checkaddress: config.contact.address,
      };
      //checkaddress is used to check if request address is in correct format or not
      if (utils.validateAddress(addressparams)) {
        const payload = { id, body: { type, address } };
        payload.rectype = config.contact.rectype;
        const contactInfo = await updateRecord(payload);
        return contactInfo;
      }
    } else {
      throw "Invalid type, Enter address as type!";
    }
  } catch (error) {
    throw error;
  }
}
//removeAddress function used to call deleteRecord from mongodb file and get deleted response or error
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
//addemail function used to call createRecord from mongodb file and get inserted response or error
async function addEmail(contactBody) {
  try {
    const { refid, refrectype, type, subtype, email } = contactBody;
    if (validation(contactBody)) {
      if (type == config.contact.type.email) {
        if (
          subtype != config.contact.subtype.primary &&
          subtype != config.contact.subtype.secondary
        ) {
          throw "Invalid Subtype, Enter subtype either primary or secondary!";
        } else if (!emailValidator.validate(email)) {
          throw "Enter Valid email Id!";
        }
        const recparams = { rectype: refrectype, id: refid };
        await getRecord(recparams);
        if (refrectype == config.patient.rectype) {
          const orgparams = { rectype: refrectype, id: refid };
          const orgid = await utils.getRecOrgId(orgparams);
          contactBody.orgid = orgid;
        }
        contactBody.rectype = config.contact.rectype;
        const contactInfo = await createRecord(contactBody);
        return contactInfo;
      } else {
        throw "Invalid Type, Enter email as type!";
      }
    }
  } catch (error) {
    throw error;
  }
}
//updateEmail function used to call updateRecord from mongodb file and get updated response or error
async function updateEmail(contactBody) {
  try {
    const { id, type, email } = contactBody;
    if (type == config.contact.type.email) {
      if (!emailValidator.validate(email)) {
        throw "Enter Valid email Id!";
      }
      const payload = { id, body: { type, email } };
      payload.rectype = config.contact.rectype;
      const contactInfo = await updateRecord(payload);
      return contactInfo;
    } else {
      throw "Invalid Type, Enter email as type!";
    }
  } catch (error) {
    throw error;
  }
}
//removeEmail function used to call deleteRecord from mongodb file and get deleted response or error
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
//addPhone function used to call createRecord from mongodb file and get inserted response or error
async function addPhone(contactBody) {
  try {
    const { refid, refrectype, type, subtype, phone } = contactBody;
    if (validation(contactBody)) {
      if (type == config.contact.type.phone) {
        if (
          subtype != config.contact.subtype.mobile &&
          subtype != config.contact.subtype.personal
        ) {
          throw "Invalid Subtype, Enter either mobile or personal!";
        } else if (!validatePhoneNumber.test(phone)) {
          throw "Enter Valid Phone Number!";
        }
        const recparams = { rectype: refrectype, id: refid };
        await getRecord(recparams);
        if (refrectype == config.patient.rectype) {
          const orgparams = { rectype: refrectype, id: refid };
          const orgid = await utils.getRecOrgId(orgparams);
          contactBody.orgid = orgid;
        }
        contactBody.rectype = config.contact.rectype;
        const contactInfo = await createRecord(contactBody);
        return contactInfo;
      } else {
        throw "Invalid Type, Enter phone as type!";
      }
    }
  } catch (error) {
    throw error;
  }
}
//updatePhone function used to call updateRecord from mongodb file and get updated response or error
async function updatePhone(contactBody) {
  try {
    const { id, type, phone } = contactBody;
    if (type == config.contact.type.phone) {
      if (!validatePhoneNumber.validate(phone)) {
        throw "EEnter Valid Phone Number!";
      }
      const payload = { id, body: { type, email } };
      payload.rectype = config.contact.rectype;
      const contactInfo = await updateRecord(payload);
      return contactInfo;
    } else {
      throw "Invalid Type, Enter phone as type!";
    }
  } catch (error) {
    throw error;
  }
}
//removePhone function used to call deleteRecord from mongodb file and get deleted response or error
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
//addFax function used to call createRecord from mongodb file and get inserted response or error
async function addFax(contactBody) {
  try {
    const { refid, refrectype, type, subtype, fax } = contactBody;
    if (validation(contactBody)) {
      if (type == config.contact.type.fax) {
        if (
          subtype != config.contact.subtype.home &&
          subtype != config.contact.subtype.work
        ) {
          throw "Invalid Subtype, Enter subtype either home or work!";
        } else if (!validateFax.test(fax)) {
          throw "Enter Valid Fax Number!";
        }
        const recparams = { rectype: refrectype, id: refid };
        await getRecord(recparams);
        if (refrectype == config.patient.rectype) {
          const orgparams = { rectype: refrectype, id: refid };
          const orgid = await utils.getRecOrgId(orgparams);
          contactBody.orgid = orgid;
        }
        contactBody.rectype = config.contact.rectype;
        const contactInfo = await createRecord(contactBody);
        return contactInfo;
      } else {
        throw "Invalid Type, Enter fax as type!";
      }
    }
  } catch (error) {
    throw error;
  }
}
//updateFax function used to call updateRecord from mongodb file and get updated response or error
async function updateFax(contactBody) {
  try {
    const { id, type, fax } = contactBody;
    if (type == config.contact.type.fax) {
      if (!validateFax.validate(fax)) {
        throw "Enter Valid Fax Number!";
      }
      const payload = { id, body: { type, email } };
      payload.rectype = config.contact.rectype;
      const contactInfo = await updateRecord(payload);
      return contactInfo;
    } else {
      throw "Invalid Type, Enter fax as type!";
    }
  } catch (error) {
    throw error;
  }
}
//removeFax function used to call deleteRecord from mongodb file and get deleted response or error
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
//processFun function is used to check if req action is valid or not, if valid then return the function
function processFun(__action) {
  const functionMapping = {
    "addAddress": addAddress,
    "updateAddress": updateAddress,
    "removeAddress": removeAddress,
    "addEmail": addEmail,
    "updateEmail": updateEmail,
    "removeEmail": removeEmail,
    "addPhone": addPhone,
    "updatePhone": updatePhone,
    "removePhone": removePhone,
    "addFax": addFax,
    "updateFax": updateFax,
    "removeFax": removeFax,
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
