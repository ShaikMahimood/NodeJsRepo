const Schema = require("validate");
const config = require("../config/app.sepc.json");

const { createRecord, getRecord, deleteRecord } = require("../db/mongodb");

const { Utils } = require("./utils");

const utils = new Utils();

//schema for alerts
const alertsSchema = new Schema({
  id: { type: String },
  rectype: { type: String },
  orgid: { type: String, required: true },
  refid: { type: String, required: true },
  type: { type: String, required: true },
  refrectype: { type: String, required: true },
  data: {},
  created: { type: String },
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
  const {
    id,
    refid,
    orgid,
    type,
    refrectype,
    data: { effectiveDateTime, component, valueQuantity },
  } = validateParams;

  //validate the schema with requested data
  let errors = alertsSchema.validate(validateParams);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0];
  } else {
    return true;
  }
}

//create alert record
async function create(alertParams) {
  try {
    const {
      refid,
      orgid,
      refrectype,
      data: {
        type,
        isaddressed,
        timestamp,
        readingrefid,
        flag,
        limitDiff,
        otherdatac,
      },
    } = alertParams;
    alertParams.rectype = config.alerts.rectype;

    const alertInfo = await createRecord(alertParams);
    console.log(alertInfo);
  } catch (error) {
    throw error;
  }
}

//remove alert record
async function remove(params) {
  try {
    const { id } = params;
    const payload = { id, rectype: config.alerts.rectype };
    const alertInfo = await deleteRecord(payload);
    console.log(alertInfo);
  } catch (error) {
    throw error;
  }
}

//generateAlert to check readings record and patient record data if any alert found then create alert record
async function generateAlert(readingcreatedobject) {
  try {
    const {
      id,
      refid,
      orgid,
      type,
      refrectype,
      data: { effectiveDateTime, component, valueQuantity },
    } = readingcreatedobject;

    validation(readingcreatedobject);

    //get patient record data and check patient devices data
    const recordData = await getRecord({
      id: refid,
      rectype: refrectype,
    });

    if (!recordData.length) throw `${rectype} record not found!`;
    const {
      data: { devices },
    } = recordData[0];
 
    const findAlert = [];

    //check patient devices data with readings data if data is not match then create alert record
    //check type is bp or not if bp check systolic and diastolic data
    if (type == config.readings.type[0]) {
      
      const [
        {
          valueQuantity: { value: value1 },
        },
        {
          valueQuantity: { value: value2 },
        },
      ] = component;
      const { sys, dia } = devices[type];
      if(sys) findAlert.push({type:config.alerts.type.bp.systolic,value:value1, min: sys.min, max: sys.max});
      if(dia) findAlert.push({type:config.alerts.type.bp.diastolic,value:value2, min: dia.min, max: dia.max});
    } else {
      //get valueQuantity value for glucose, pulse, oxygen, weight types
      const { value } = valueQuantity;
      const { min, max } = devices[type];
      if(min && max) findAlert.push({type, value, min, max});
    }
    //loop findAlert array if any alert found
    for(i=0;i<findAlert.length;i++){
      const {type, value, min, max} =findAlert[i];
      const params = { min, max, value };
      //checking remaining devices data
      const utilsdata = utils.checkingAndGetDeviceData(params);
      if(!utilsdata.flag) continue;
      const { flag, limitDiff, otherdata } = utilsdata;

        const alertParams = {
          refid,
          orgid,
          refrectype,
          data: {
            isaddressed: false,
            timestamp: effectiveDateTime,
            readingrefid: id,
            type,
            flag,
            limitDiff,
            otherdata,
          },
        };
        await create(alertParams);
    }
  } catch (error) {
    console.log(error);
  }
}

//get alert record
async function getAlerts(req, res) {
  try {
    const {
      query: { refid, startdate, enddate },
    } = req;
    const payload = { refid, rectype: config.alerts.rectype };

    const alertsInfo = await getRecord(payload);
    if (!alertsInfo.length) throw `record not found!`;
    const alertsData = [];

    alertsInfo.map((alert) => {
      const { timestamp } = alert.data;
      if (startdate <= timestamp && timestamp <= enddate) {
        alertsData.push(alert);
      }
    });
    console.log(alertsInfo);
    res.status(200).json({ status: "Success", results: alertsData });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error.message });
  }
}

module.exports = {
  create,
  getAlerts,
  remove,
  generateAlert,
};
