const config = require("../config/app.sepc.json");
const {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecord,
  aggr,
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
    const patients = await createRecord(req.body);
    res.status(200).json({ status: "Success", results: patients });
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
    const patients = await getRecord(payload);

    const validoffice = await utils.getUserOffices(id);

    const patientResult = [];
    patients.map((patient) => {
      const { orgid } = patient;
      if (validoffice.includes(orgid)) {
        patientResult.push(patient);
      }
    });
    if (!patientResult.length)
      throw `user Don't have access to get patient details!`;

    res.status(200).json({ status: "Success", results: patients });
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

    const patients = await updateRecord(payload);
    res.status(200).json({ status: "Success", results: patients });
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
    const patients = await deleteRecord(payload);
    res.status(200).json({ status: "Success", results: patients });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}
//getDetails function used get patient data and patient contact data
async function getDetails(req, res) {
  try {
    const { body } = req;
    const payload = body;

    const { id } = payload;

    const condition = {};
    if (id) {
      if (Array.isArray(id)) {
        condition["cond"] = {
          $match: {
            refid: { $in: id },
          },
        };
      } else
        condition["cond"] = {
          $match: {
            refid: id,
          },
        };
    }
    //get patient records from mongodb with patient params
    const patientParams = { rectype: config.patient.rectype };
    const contactParams = { rectype: config.contact.rectype };
    const officeParams = { rectype: config.organization.rectype };

    //sloving all promises with Promise.all()
    const [patients, contacts, offices, readings, alerts, record] =
      await Promise.all([
        getRecord(patientParams),
        getRecord(contactParams),
        getRecord(officeParams),
        readingsRecord(condition),
        alertsRecord(condition),
        records(condition),
      ]);

    const params = {
      patients,
      contacts,
      offices,
      readings,
      alerts,
      record,
    };

    //call parsingPatientData function and get patient related data with patient params
    let patientResult = parsingPatientData(params);

    //checking patient data
    if (!patientResult.length) throw `Patient details Not Found!`;

    if (id) {
      if(Array.isArray(id))
        patientResult = patientResult.filter(({id:recid}) => id.some((id) => id === recid));
      else
        patientResult = patientResult.find((data) => data.id == id);
    }

    res.status(200).json({ status: "Success", results: patientResult });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "Error :", error: error });
  }
}

//getPatientData used to get Patient form patient record
function parsingPatientData(params) {
  try {
    const { patients, contacts, offices, readings, alerts, record } = params;

    //mapping contacts and getting contact Data from contacts records
    const contactObj = {};
    contacts.map((rec) => {
      const { refid, type, subtype } = rec;

      if (!contactObj[refid]) contactObj[refid] = {};

      contactObj[refid][type] = {
        ...contactObj[refid][type],
        [subtype]: rec[type],
      };
    });

    //mapping offices and getting office names from organization records
    const officeObj = {};
    offices.map((rec) => {
      const { id, name } = rec;
      officeObj[id] = name;
    });

    //mapping readings and getting readings data from readings records
    const readingObj = {};
    readings.map((rec) => {
      let { refid, type, value1, value2, timestamp } = rec;
      if (!readingObj[refid]) readingObj[refid] = {};
      if (value2 == undefined) value2 = "Null";
      readingObj[refid][type] = {
        value1,
        value2,
        timestamp,
      };
    });

    //mapping alertObj and getting alerts data from alerts records
    const alertObj = {};
    alerts.map((rec) => {
      const { refid, type, limitdiff, flag, timestamp, min, max, actualvalue } =
        rec;
      if (!alertObj[refid]) alertObj[refid] = {};

      alertObj[refid][type] = {
        limitdiff,
        flag,
        timestamp,
        min,
        max,
        actualvalue,
      };
    });

    //mapping recordObj and getting record data from records
    const recordObj = {};
    record.map((rec) => {
      const { refid, type, data } = rec;
      if (!recordObj[refid]) recordObj[refid] = {};

      recordObj[refid][type] = { data };
    });

    //mapping patients and getting patient data from patient records
    const patientResult = patients.map((rec) => {
      const {
        id,
        firstname,
        lastname,
        dob,
        age,
        gender,
        orgid,
        status,
        createdBy,
        created,
        data: { devices },
      } = rec;

      const { email, phone, address } = contactObj[id] || {};
      const patientData = {
        id,
        firstname,
        lastname,
        dob,
        age,
        gender,
        orgid,
        officeName: officeObj[orgid] || {},
        status,
        createdBy,
        created,
        email,
        phone,
        address,
        devices,
        reading: readingObj[id] || {},
        alert: alertObj[id] || {},
        record: recordObj[id] || {},
      };

      return patientData;
    });
    return patientResult;
  } catch (error) {
    throw error;
  }
}

//readingsRecord to get readings from aggregation function
function readingsRecord(params) {
  return new Promise(async (resolve, reject) => {
    try {
      const { cond } = params;
      const query = [
        {
          $group: {
            _id: { refid: "$refid", type: "$type" },
            timestamp: { $last: "$data.effectiveDateTime" },
            data: { $last: "$data" },
          },
        },
        {
          $project: {
            _id: 0,
            refid: "$_id.refid",
            type: "$_id.type",
            timestamp: 1,
            value1: {
              $cond: {
                if: { $eq: ["$_id.type", "bp"] },
                then: {
                  $arrayElemAt: ["$data.component.valueQuantity.value", 0],
                },
                else: "$data.valueQuantity.value",
              },
            },
            value2: {
              $arrayElemAt: ["$data.component.valueQuantity.value", 1],
            },
          },
        },
      ];
      if (cond) {
        query.push(cond);
      }
      const rectype = config.readings.rectype;
      const readingsData = await aggr(rectype, query);
      resolve(readingsData);
    } catch (error) {
      reject(error);
    }
  });
}

//alertsRecord to get alerts from aggregation function
function alertsRecord(params) {
  return new Promise(async (resolve, reject) => {
    try {
      const { cond } = params;
      const query = [
        {
          $group: {
            _id: { refid: "$refid", type: "$data.type" },
            timestamp: { $last: "$data.timestamp" },
            data: { $last: "$data" },
          },
        },
        {
          $project: {
            _id: 0,
            refid: "$_id.refid",
            type: "$_id.type",
            timestamp: 1,
            limitdiff: "$data.limitDiff",
            flag: "$data.flag",
            min: "$data.otherdata.min",
            max: "$data.otherdata.max",
            actualvalue: "$data.otherdata.actualvalue",
          },
        },
      ];
      if (cond) {
        query.push(cond);
      }
      const rectype = config.alerts.rectype;
      const alertsData = await aggr(rectype, query);
      resolve(alertsData);
    } catch (error) {
      reject(error);
    }
  });
}

//records to get record from aggregation function
function records(params) {
  return new Promise(async (resolve, reject) => {
    try {
      const { cond } = params;
      const query = [
        {
          $group: {
            _id: { refid: "$refid", type: "$type" },
            timestamp: { $last: "$created" },
            data: { $last: "$data" },
          },
        },
        {
          $project: {
            _id: 0,
            refid: "$_id.refid",
            type: "$_id.type",
            timestamp: 1,
            data: 1,
          },
        },
      ];
      if (cond) {
        query.push(cond);
      }
      const rectype = config.records.rectype;
      const recordsData = await aggr(rectype, query);
      resolve(recordsData);
    } catch (error) {
      reject(error);
    }
  });
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
    const payload = {
      rectype: config.patient.rectype,
      id,
      body: { data: { devices } },
    };

    const patientParams = { rectype: config.patient.rectype, id };
    const patientData = await getRecord(patientParams);
    if (!patientData.length) throw `record not found!`;
    const { data } = patientData[0];
    if (data) {
      const { devices: existingdevices } = data;
      if (existingdevices) {
        const updatedDevices = { ...existingdevices, ...devices };
        payload.body.data.devices = updatedDevices;
      }
    }
    const patients = await updateRecord(payload);
    res.status(200).json({ status: "Success", results: patients });
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
};
