const config = require("../config/app.sepc.json");
const {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecord,
} = require("../db/mongodb");

const { Utils } = require("../common/utils");

const utils = new Utils();

//createRec function used to call createRecord from mongodb file and get inserted response or error
async function createRec(req, res) {
  try {
    const {
      body: { orgid, dob },
      session: { id },
    } = req;

    const orgParams = {
      rectype: config.organization.rectype,
      id: orgid,
      status: config.common.status.active,
    };
    const orgData = await getRecord(orgParams);
    if (!orgData.length) throw "Invalid/Inactive record!";

    req.body.createdBy = id;
    utils.validateDob(dob);

    req.body.rectype = config.patient.rectype;
    const patientInfo = await createRecord(req.body);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//getRec function used to call getRecord from mongodb file and get record response or error
async function getRec(req, res) {
  try {
    const {
      query,
      session: { id },
    } = req;

    const payload = query;
    payload.rectype = config.patient.rectype;
    const patientInfo = await getRecord(payload);

    const validoffice = await utils.getUserOffices(id);

    const patientResult = [];
    patientInfo.map((patient) => {
      const { orgid } = patient;
      if (validoffice.includes(orgid)) {
        patientResult.push(patient);
      }
    });
    if (!patientResult.length)
      throw `user Don't have access to get patient details!`;

    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error.message });
  }
}

//updateRec function used to call updateRecord from mongodb file and get updated response or error
async function updateRec(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.patient.rectype;
    payload.body = req.body;

    //check if status is inactive or not, if inactive then check inactivereason and dateinactivate
    if (req.body.status == config.common.status.inactive) {
      if (req.body.inactivereason)
        req.body.dateinactivate = utils.getCurrentDateTime();
      else throw "Enter inactivereason!";
    }

    const patientInfo = await updateRecord(payload);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//deleteRec function used to call deleteRecord from mongodb file and get deleted response or error
async function deleteRec(req, res) {
  try {
    const { query } = req;
    const payload = query;

    payload.rectype = config.patient.rectype;
    const patientInfo = await deleteRecord(payload);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}
//getDetails function used get patient data and patient contact data
async function getDetails(req, res) {
  try {
    const {
      query,
      session: { id },
    } = req;
    const payload = query;

    const patientParams = { rectype: config.patient.rectype };
    const contactParams = { rectype: config.contact.rectype };
    const officeParams = { rectype: config.organization.rectype };
    const [patientInfo, contactInfo, officeInfo] = await Promise.all([
      getRecord(patientParams),
      getRecord(contactParams),
      getRecord(officeParams),
    ]);

    const patientData = getPatientData(patientInfo, contactInfo, officeInfo);

    const validoffice = await checkingUserOffices(id);
    let patientResult = [];
    patientData.map((patient) => {
      const { orgid } = patient;
      if (validoffice.includes(orgid)) {
        patientResult.push(patient);
      }
    });

    if (!patientResult.length)
      throw `user Don't have access to get patient details!`;

    if (payload.status) {
      patientResult = patientResult.filter(
        (data) => data.status == payload.status
      );
    }
    if (payload.id) {
      patientResult = patientResult.find((data) => data.id == payload.id);
    }

    res.status(200).json({ status: "Success", results: patientResult });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//getPatientData used to get Patient form patient
function getPatientData(patientInfo, contactInfo, officeInfo) {
  try {
    const patientResult = patientInfo.map((patient) => {
      const {
        id,
        title,
        firstname,
        lastname,
        dob,
        age,
        gender,
        orgid,
        status,
        createdBy,
        created,
      } = patient;
      const contactData = {};
      contactInfo.map((contactObj) => {
        const { refid, address, phone, email } = contactObj;
        if (refid == id) {
          if (address) contactData["address"] = address;
          if (phone) contactData["phone"] = phone;
          if (email) contactData["email"] = email;
        }
      });
      const { email, phone, address } = contactData;
      let officeName;
      officeInfo.map((office) => {
        const { id, name } = office;
        if (orgid == id) {
          officeName = name;
        }
      });

      const patientData = {
        id,
        title,
        firstname,
        lastname,
        dob,
        age,
        gender,
        orgid,
        officeName,
        status,
        createdBy,
        created,
        email,
        phone,
        address,
      };

      return patientData;
    });
    return patientResult;
  } catch (error) {
    reject(error);
  }
}

//validateOffices to validate offices
async function validateOffices(req, res, next) {
  try {
    const {
      body: { orgid },
      session: { id },
    } = req;

    const offices = await utils.getUserOffices(id);

    if (!offices.includes(orgid))
      throw "User Don't have access to create patient and Enter Valid Orgid!";
    next();
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

//update patient device details
async function updateDeviceDetails(req, res) {
  try {
    const {
      body: {
        id,
        data: { devices },
      },
    } = req;
    let updatedDevices = {};
    const payload = {
      rectype: config.patient.rectype,
      id,
      body: { data: { devices } },
    };

    const patientParams = { rectype: config.patient.rectype, id };
    const patientData = await getRecord(patientParams);
    if (!patientData.length) throw `record not found!`;

    if (patientData[0].data) {
      const {
        data: { devices: recorddevices },
      } = patientData[0];
      if (recorddevices) {
        Object.keys(recorddevices).forEach((element) => {
          if (!updatedDevices[element])
            updatedDevices[element] = recorddevices[element];
        });
        Object.keys(devices).forEach((element) => {
          if (!updatedDevices[element])
            updatedDevices[element] = devices[element];
          updatedDevices[element] = devices[element];
        });

        console.log(updatedDevices);
        payload.body.data.devices = updatedDevices;
      }
    }
    const patientInfo = await updateRecord(payload);
    res.status(200).json({ status: "Success", results: patientInfo });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "Error :", error: error });
  }
}
//export all functions
module.exports = {
  createRec,
  getRec,
  updateRec,
  deleteRec,
  getDetails,
  updateDeviceDetails,
  validateOffices,
};
