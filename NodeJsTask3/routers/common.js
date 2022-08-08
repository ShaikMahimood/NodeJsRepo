const Router = require("express");
const router = Router();
const { uploadFile} = require('../src/common/aws')
const { Validation, addFile, deleteFile} = require('../src/common/file');

//Uploading single File to aws s3 bucket
router.post('/upload', uploadFile);

router.post('/addFile', Validation, addFile);

router.delete('/deleteFile', deleteFile);

module.exports = router;