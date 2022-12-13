const { dbConnection } = require("../db/mongodb");
const config = require("../config/app.sepc.json");

const readings = require("../../filedata/readings.json");
const inputrecords = require("../../filedata/records.json");

async function createRecord(payload) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await dbConnection();

      const result = await db.collection("records").insertMany(payload); //insert record into database

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function readingsRecord(id) {
  try {
    console.log(id);
    const db = await dbConnection();
    const result = await db
      .collection(config.readings.rectype)
      .aggregate([
        {
          $match: {
            $expr:{
              refid:{
                $cond:{if:{ $eq:["$refid", id]}, then: id, else:{ $in: id}}
              }
            }
          }
        },
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
      ])
      .toArray();
    console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}

async function alertsRecord(id) {
  try {
    const db = await dbConnection();
    const result = await db
      .collection(config.alerts.rectype)
      .aggregate([
        {
          $match: {
            refid: id,
          },
        },
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
            limitDiff: "$data.limitDiff",
            flag: "$data.flag",
            min: "$data.otherdata.min",
            max: "$data.otherdata.max",
            actualvalue: "$data.otherdata.actualvalue",
          },
        },
      ])
      .toArray();
    console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}

async function records(id) {
  try {
    const db = await dbConnection();
    const result = await db
      .collection(config.records.rectype)
      .aggregate([
        {
          $match: {
            $cond: [{ if: [id], then: { refid: id }, else: { refid: 1 } }],
          },
        },
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
      ])
      .toArray();
    console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}

createRecord(inputrecords);
//readingsRecord("20220801003889");
//alertsRecord("20220801003889");
//records();
module.exports = { readingsRecord, alertsRecord, records };
