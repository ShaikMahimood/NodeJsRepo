const Schema = require("validate");
const path = require("path");
const { createRecord, deleteRecord } = require("../db/mongodb");
const config = require("../config/app.sepc.json");
const { uploadFile, deleteFile } = require("../aws/s3.js");
const { Utils } = require("../common/utils");

const utils = new Utils();
//Schema for file to check type and required fields to validate
const file = new Schema({
  rectype: { type: String }, //file,
  refid: { type: String, required: true },
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
      file: { originalname, mimetype: type, filename, size, path: filepath },
      body: { refid, refrectype },
    } = req;

    //take Name of the file without extension
    const name = path.parse(filename).name;

    const status = config.file.status.completed;
    const addpayload = {
      rectype,
      refid,
      refrectype,
      type,
      originalname,
      name,
      size,
      status,
    };
    //check if refrectype is patient or not, if patient then find orgid
    if (refrectype == config.patient.rectype) {
      const orgparams = { rectype: refrectype, id: refid };
      const orgid = await utils.getRecOrgId(orgparams);
      addpayload.orgid = orgid;
    }

    //find filecontent from getfilecontent function from filepath
    const fileContent = utils.getFileContent(filepath);
    const filedata = { filename: originalname, fileContent };
    //uploadFile function used to upload file into s3bucket
    const uploadInfo = await uploadFile(filedata);
    //get url from s3bucket location
    addpayload.url = uploadInfo.Location;

    const fileinfo = await createRecord(addpayload); //calling createRecord function and get recorded information from mongodb file

    res.status(200).json({ status: "Success", results: fileinfo }); //get success and results response if record is successfully inserted
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error }); //get error status if error while occurs
  }
}

//deleteFile function is used to delete the file
async function Filedelete(req, res) {
  try {
    const { query } = req;
    const payload = query;
    payload.rectype = config.file.rectype;
    const originalname = await utils.getFileOriginalname(payload);
    let deleteinfo = await deleteFile(originalname);
    deleteinfo = await deleteRecord(payload); //calling deleterecord function from mongodb file
    res.status(200).json({ status: "Success", results: deleteinfo }); //get success and results response if record is successfully deleted
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error }); //get error status if error while occurs
  }
}

module.exports = { Validation, addFile, Filedelete }; //export all functions
