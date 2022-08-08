const AWS = require("aws-sdk");
const fs = require("fs");
const config = require("../config/app.sepc.json");
var formidable = require('formidable');

const s3 = new AWS.S3({
  accessKeyId: config.aws.ACCESS_KEY_ID,
  secretAccessKey: config.aws.SECRET_ACCESS_KEY,
});

async function uploadFile(req, res) {
  try {
    const {
      body: { fileName },
      file,
    } = req;
    // Read content from the file
  //const fileContent = fs.readFileSync(file);
    const params = {
      acl: "public-read",
      Bucket: config.aws.Bucket_Name,
      Key: fileName, // File name you want to save as in S3
      Body: file,
    };

    // Uploading files to the bucket
    const upload = await s3.upload(params).promise();
    if (!upload) {
      res.status(400).json({
        status: "Successfully uploaded ",
        results: upload,
      });
    }
  } catch (error) {
    console.log("Error :" + error);
    throw error;
  }
}

module.exports = { uploadFile };
