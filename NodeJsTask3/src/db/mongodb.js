const { MongoClient } = require("mongodb");
const config = require("../config/app.sepc.json");

const { Utils } = require("../common/utils");

const utils = new Utils();
let mongoClient;
//dbconnection function is used to connect with mongodb and return database
async function dbConnection() {
  //connection url
  const url = config.db.mongodburl;
  //connecting to mongoclient with url
  const client = new MongoClient(url);
  try {
    // Connect to the MongoDB
    mongoClient = await client.connect();
    const db = mongoClient.db(config.db.dbname);
    console.log("db Connected!");
    return db;
  } catch (error) {
    throw error;
  }
}
//getNextSequenceValue is used to get next value for id
async function getNextSequenceValue() {
  const db = await dbConnection(); //connect to mongodb and get databases

  const collname = config.sequence.rectype; //take collection name from config file
  const sequenceDoc = await db
    .collection(collname)
    .findOneAndUpdate({ id: "0" }, { $inc: { data: 1 } }); //find and update sequence values
  return sequenceDoc.value.data.toString(); //return ouput data
}

//createRecord function is used to insert record into collection with req body
async function createRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      item.created = utils.getCurrentDateTime(); //getCurrentDateTime() is used to get current data and time from Utils file

      const collname = item.rectype; //collection name

      const db = await dbConnection();

      item.id = await getNextSequenceValue(); //find new value for id

      await db.collection(collname).insertOne(item); //insert record into database
      resolve(item);
    } catch (error) {
      reject(error);
    } finally {
      await mongoClient.close();
    }
  });
}

//getRecord function is used to get data from collection
async function getRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const { rectype, ...restParams } = item; //pass rectype and restparams to get data from collections
      const db = await dbConnection();
      const collname = rectype;
      const recList = await db.collection(collname).find(restParams).toArray(); //get data from requested parameters
      resolve(recList); //get data from database
    } catch (error) {
      reject(error);
    } finally {
      await mongoClient.close();
    }
  });
}

//updateRecord function is used to update the record from collection
async function updateRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const { rectype, id, body } = item; //take item object and pass required values
      const db = await dbConnection();
      const collname = rectype;
      const newRec = await db
        .collection(collname)
        .updateOne({ id }, { $set: body }); //find the id and update the record
      resolve(item); //if data updated get the update record
    } catch (error) {
      reject(error);
    } finally {
      await mongoClient.close();
    }
  });
}

//deleteRecord function is used to delete the record from collection
async function deleteRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const { rectype, id } = item; //pass rectype and id to get data from collections
      const db = await dbConnection();
      const collname = rectype; //collection name
      const result = await db.collection(collname).deleteOne({ id }); //find and update the selected id
      if (!result.deletedCount) {
        throw `${rectype} Record is Not Found!`;
      }
      resolve(`${rectype} record is successfully deleted!`);
    } catch (error) {
      reject(error);
    } finally {
      await mongoClient.close();
    }
  });
}

dbConnection();
module.exports = { createRecord, updateRecord, deleteRecord, getRecord }; //export all functions
