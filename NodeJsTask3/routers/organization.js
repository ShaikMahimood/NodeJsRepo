const Router = require("express");
const router = Router();

const { Validation } = require("../src/organization/organization.js");
const {
    createRec,
    getRec,
    updateRec,
    deleteRec,
  } = require('../src/organization/controller.js');

router.post("/create/", Validation, createRec);

router.get("/get/", getRec);

router.put("/update/", updateRec);

router.delete("/delete/", deleteRec);

module.exports = router;
