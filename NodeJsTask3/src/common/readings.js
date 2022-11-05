const Schema = require("validate");
const config = require("../config/app.sepc.json");

const {
  createRecord,
  updateRecord,
  getRecord,
  deleteRecord,
} = require("../db/mongodb");

const { generateAlert } = require("./alerts");
const { Utils } = require("./utils");

const utils = new Utils();

//schema for reading
const readingSchema = new Schema({
  id: { type: String },
  rectype: { type: String },
  orgid: { type: String },
  refid: { type: String, required: true },
  refrectype: { type: String, enum: [config.patient.rectype] },
  type: { type: String, enum: config.readings.type }, //[bp, glucose, pulse, oxygen, weight]
  data: {},
  created: { type: String },
});

//validation function is used to validate requested fields with the schema
function validation(validateParams) {
  const {
    refid,
    orgid,
    type,
    refrectype,
  } = validateParams;

  //validate the schema with requested data
  let errors = readingSchema.validate(validateParams);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    throw errors[0];
  } else {
    return true;
  }
}

//create readings record
async function create(req, res) {
  try {
    const { refid, type, value1, value2, effectiveDateTime } = req.body;
    //get patient orgid with orgparams from patient record
    const orgParams = { id: refid, rectype: config.patient.rectype };
    const orgid = await utils.getRecOrgId(orgParams);

    //payload for creating readings record
    const payload = {
      refid,
      orgid,
      type,
      rectype: config.readings.rectype,
      refrectype: config.patient.rectype,
      data: {
        effectiveDateTime,
        component: [],
        valueQuantity: {},
      },
    };
    validation(payload);
    //checking type is bp or not, if bp assign component data otherwise component data is empty
    if (type == config.readings.type[0]) {
      //checking value1, value2 have values or not
      if (!value1 || !value2) throw `Enter value1 and value2 for type bp`;

      //adding components for bp type
      payload.data.component = [
        {
          valueQuantity: {
            value: value1,
            unit: config.readings.units[type],
          },
        },
        {
          valueQuantity: {
            value: value2,
            unit: config.readings.units[type],
          },
        },
      ];
    } else {
      //adding valueQuantity for glucose, pulse, oxygen, weight types, otherwise valueQuantity is empty
      payload.data.valueQuantity = {
        value: value1,
        unit: config.readings.units[type],
      };
    }

    const recordinfo = await createRecord(payload);
    if (!recordinfo) throw "record not created!";

    //generateAlert with readings created record data
    await generateAlert(recordinfo);
    res.status(200).json({ status: "Success", results: recordinfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error.message });
  }
}

//remove readings record
async function remove(req, res) {
  try {
    const { query } = req;
    const payload = query;

    payload.rectype = config.readings.rectype;
    const readingsInfo = await deleteRecord(payload);
    res.status(200).json({ status: "Success", results: readingsInfo });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
}

module.exports = {
  create,
  remove,
};
