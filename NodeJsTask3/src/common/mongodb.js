const { MongoClient } = require("mongodb");

//dbconnection function is used to connect with mongodb and return database
async function dbConnection() {
  const url =
    "mongodb+srv://new_user:SlTh0ZtXzWxORlXu@cluster0.apboi.mongodb.net/Task3?retryWrites=true&w=majority";
  const client = new MongoClient(url);
  try {
    // Connect to the MongoDB
    let clientdata = await client.connect();
    const db = clientdata.db("Task3");
    console.log("db Connected!");
    return db;
  } catch (error) {
    console.error(error);
  }
}
//getNextSequenceValue is used get next value for id
async function getNextSequenceValue() {
  const db = await dbConnection();
  const collname = "sequence";
  const sequenceDoc = await db
    .collection(collname)
    .findOneAndUpdate({ id: "0" }, { $inc: { data: 1 } });
  console.log("sequence id" + sequenceDoc.value.id);
  return parseInt(sequenceDoc.value.data);
}

//createRecord function is used to insert record into collection with req body
async function createRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await dbConnection();
      item.created = new Date();
      item.id = await getNextSequenceValue();
      console.log("generated id" + item.id);
      const collname = item.rectype;
      const newRec = await db.collection(collname).insertOne(item);
      console.log("Inserted record: " + newRec);
      resolve(item);
    } catch (error) {
      reject(error);
    }
  });
}

//getRecord function is used to get data from collection
async function getRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const { rectype, ...restParams } = item;
      console.log(restParams);
      const db = await dbConnection();
      const collname = rectype;
      const getRec = await db.collection(collname).find(restParams).toArray();
      if (getRec == "") {
        throw "Record is not available for this id!";
      }
      resolve(getRec);
    } catch (error) {
      reject(error);
    }
  });
}

//updateRecord function is used to update the record from collection
async function updateRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const { rectype, id, body } = item;
      const db = await dbConnection();
      const collname = rectype;
      console.log(collname);
      const newRec = await db
        .collection(collname)
        .updateOne({ id: id }, { $set: body });
      console.log(newRec);
      if (newRec.modifiedCount == 0) {
        throw "Record is not found!";
      }
      resolve(newRec);
    } catch (error) {
      reject(error);
    }
  });
}

//deleteRecord function is used to delete the record from collection
async function deleteRecord(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const { rectype, ...restParams } = item;
      //console.log(restParams);
      const db = await dbConnection();
      const collname = rectype;
      const result = await db.collection(collname).deleteOne(restParams);
      if (result.deletedCount == 0) {
        throw "id is not found!";
      }
      console.log(result);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

dbConnection();
module.exports = { createRecord, updateRecord, deleteRecord, getRecord };
