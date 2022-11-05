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
  refrectype: { type: String },
  data: {},
  created: { type: String },
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
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
    validation(alertParams);
    
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
    const { id, refid, orgid, type, effectiveDateTime, refrectype, data } =
      readingcreatedobject;

    let utilsdata = {};

    //get patient record data and check patient devices data
    const recordData = await getRecord({
      id: refid,
      rectype: refrectype,
    });

    if (!recordData.length) throw `${rectype} record not found!`;
    const {
      data: { devices },
    } = recordData[0];

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
      ] = data.component;

      const { sys, dia } = devices[type];
      const sysparams = { min: sys.min, max: sys.max, value: value1 };

      //checking systolic data
      if (utils.checkingDeviceData(sysparams)) {
        utilsdata = utils.getFlagLimitDiffAndOtherdata(sysparams);
        const { flag, limitDiff, otherdata } = utilsdata;

        const alertParams = {
          refid,
          orgid,
          refrectype,
          data: {
            isaddressed: false,
            timestamp: effectiveDateTime,
            readingrefid: id,
            type: config.alerts.type.bp.systolic,
            flag,
            limitDiff,
            otherdata,
          },
        };
        await create(alertParams);
      }

      const diaparams = { min: dia.min, max: dia.max, value: value2 };
      //checking diastolic data
      if (utils.checkingDeviceData(diaparams)) {
        utilsdata = utils.getFlagLimitDiffAndOtherdata(diaparams);
        const { flag, limitDiff, otherdata } = utilsdata;

        const alertParams = {
          refid,
          orgid,
          refrectype,
          data: {
            isaddressed: false,
            timestamp: effectiveDateTime,
            readingrefid: id,
            type: config.alerts.type.bp.diastolic,
            flag,
            limitDiff,
            otherdata,
          },
        };
        await create(alertParams);
      }
    } else {
      const { value } = data.valueQuantity;
      const { min, max } = devices[type];
      const params = { min, max, value };

      //checking remaining devices data
      if (utils.checkingDeviceData(params)) {
        utilsdata = utils.getFlagLimitDiffAndOtherdata(params);
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
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  create,
  remove,
  generateAlert,
};
