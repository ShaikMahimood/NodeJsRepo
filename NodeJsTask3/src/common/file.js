const Schema = require("validate");
const path = require("path");
const { createRecord, deleteRecord } = require("../db/mongodb");
const config = require("../config/app.sepc.json");
const { uploadFile, deleteFile } = require("../aws/s3.js");
const { Utils } = require("../common/utils");

const utils = new Utils();
//Schema for file to check type and required fields to validate
const file = new Schema({
  id: { type: Number },
  rectype: { type: String }, //file,
  refid: { type: String, required: true, },
  refrectype: {
    type: String,
    enum: [config.patient.rectype, config.organization.rectype],
    required: true,
  },
  orgid: { type: String },
  status: { type: String, enum: config.file.status },
  url: { type: String }, //s3 URL
  name: { type: String }, //Name of the file without extension
  originalname: { type: String }, //Original File name including extension
  type: { type: String },
  size: { type: Number },
  created: { type: String },
  data: {},
});

//Validation function is used to validate the schema with required types and fields
function Validation(req, res, next) {
  //assign req values to object
  const {
    body: {
      id,
      rectype,
      refid,
      refrectype,
      orgid,
      status,
      url,
      name,
      organization,
      type,
      size,
      created,
    },
  } = req;
  //pass required fields to filedata
  const fileData = {
    id,
    rectype,
    refid,
    refrectype,
    orgid,
    status,
    url,
    name,
    organization,
    type,
    size,
    created,
  };
  //check validate conditions and send next() otherwise send error
  let errors = file.validate(fileData);
  if (errors.length) {
    errors = errors.map((eRec) => {
      return { path: eRec.path, message: eRec.message };
    });
    res.send(errors);
  } else {
    next();
  }
}

//addFile function is used and files into mongodb files collection
async function addFile(req, res) {
  try {
    const rectype = config.file.rectype;
    const {
      file: { originalname, mimetype : type, filename, size, path : filepath},
      body: { refid, refrectype },
    } = req;
    const fileContent = utils.getFileContent(filepath).toString("utf-8");
    const filedata = { filename: originalname, fileContent };
    const uploadInfo = await uploadFile(filedata);
    const url = uploadInfo.Location;
    const name = path.parse(filename).name;
    const orgparams = { rectype: refrectype, id: refid};
    const status = config.file.status.completed;
    const addpayload = {
      rectype,
      refid,
      refrectype,
      url,
      type,
      originalname,
      name,
      size,
      status
    };
    if(refrectype == config.patient.rectype){
      const orgid = await utils.getRecOrgId(orgparams);
      addpayload.orgid = orgid;
    }
    
    console.log("payload data", addpayload);
    const fileinfo = await createRecord(addpayload); //calling createRecord function and get recorded information from mongodb file
    console.log(fileinfo);

    res.status(200).json({ status: "Success", results: fileinfo }); //get success and results response if record is successfully inserted
  } catch (error) {
    console.log("Error :", error);
    res.status(400).json({ status: "Error :", error: error.message }); //get error status if error while occurs
  }
}

//deleteFile function is used to delete the file
async function Filedelete(req, res) {
  try {
    const { query } = req;
    const payload = query;
    console.log(payload);
    payload.rectype = config.file.rectype;
    const datainfo = deleteFile(payload);
    const data = await deleteRecord(payload); //calling deleterecord function from mongodb file
    res.status(200).json({ status: "Success", results: data }); //get success and results response if record is successfully deleted
  } catch (error) {
    console.log("Error :" + error);
    res.status(400).json({ status: "Error :", error: error.message }); //get error status if error while occurs
  }
}

module.exports = { Validation, addFile, Filedelete }; //export all functions
