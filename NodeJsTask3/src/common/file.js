const Schema = require("validate");
const { createRecord, deleteRecord } = require("./mongodb");
const config = require('../config/app.sepc.json');

const file = new Schema({
  id: { type: Number },
  rectype: { type: String, required: true }, //file,
  refid: { type: String, required: true },
  refrectype: { type: String, enum: ['patient', 'organization'], required: true },
  orgid: { type: String, required: true },
  status: { type: String, enum: ['completed', 'pending', 'error'], required: true },
  url: { type: String }, //s3 URL
  name: { type: String }, //Name of the file without extension
  originalname: { type: String }, //Original File name including extension
  type: { type: String },
  size: { type: Number },
  created: { type: String },
  data: {},
});

function Validation(req, res, next) {
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
  //req.data = patientData.created;
  //check validate conditions and send next() otherwise send error
  const error = file.validate(fileData);
  console.log(error);
  if (error == null || error.length === 0) {
    next();
  } else {
    console.log("error");
    res.send("error");
  }
}

async function addFile(req, res) {
  try {
    req.body.rectype = config.rectype.file;
    console.log("url: "+req.body.url);
    const fileinfo = await createRecord(req.body)
    console.log(fileinfo);
    res.status(200).json({ status: "Success", results: fileinfo });
} catch (error) {
    console.log("Error :" + error);
    res.status(200).json({ status: "Error :", error: error });
}
}

async function deleteFile(req, res){
  try {
    const {
        query
    } = req;
    if (query.id) {
        query.id = parseInt(query.id)
    }

    const payload = query;
    console.log(payload);
    payload.rectype = "file";

    const data = await deleteRecord(payload);
    res.status(200).json({ status: "Success", results: data });
} catch (error) {
    console.log("Error :" + error);
    res.status(200).json({ status: "Error :", error: error });
}
}
module.exports = { Validation, addFile, deleteFile};