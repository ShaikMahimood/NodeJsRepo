const Router = require("express");
const router = Router();
const { Validation, addFile, Filedelete} = require('../src/common/file');

router.post('/uploadfile', Validation, addFile);

router.delete('/deletefile', Filedelete);

module.exports = router;