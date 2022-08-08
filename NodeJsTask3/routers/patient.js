const Router = require("express");
const router = Router();

const { Validation } = require("../src/patient/patient");
const {
  createRec,
  getRec,
  updateRec,
  deleteRec,
} = require("../src/patient/controller");

router.post("/create/", Validation, createRec);

router.get("/get/", getRec);

router.put("/update/", updateRec);

router.delete("/delete/", deleteRec);

module.exports = router;
