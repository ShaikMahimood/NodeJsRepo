const Router = require("express");
const router = Router();

const { Validation } = require("../src/patient/patient");
const {
  createRec,
  getRec,
  updateRec,
  deleteRec,
  getDetails,
  updateDeviceDetails,
  validateOffices
} = require("../src/patient/controller");
const { create } = require('../src/common/readings');

const { createRecords } = require("../src/common/records");

const { verifyUserToken } = require("../src/middleware/auth");

const { processFun, getContact } = require("../src/common/contact");

const { createActivities } = require("../src/user/activities");

const config = require("../src/config/app.sepc.json");

router.post("/create", verifyUserToken, Validation, validateOffices, createActivities, createRec);

router.get("/get", verifyUserToken, createActivities, getRec);

router.put("/update", verifyUserToken, createActivities, updateRec);

router.delete("/delete", verifyUserToken, createActivities, deleteRec);

router.get("/details", verifyUserToken, createActivities, getDetails);

router.post("/createrecords", verifyUserToken, createActivities, createRecords);

router.post("/contact", verifyUserToken, createActivities, async (req, res) => {
  try {
    const __action = req.body.__action;
    const processFunction = processFun(__action);
    const contactBody = req.body.body || {};
    contactBody.refrectype = config.patient.rectype;
    const result = await processFunction(contactBody);
    res.status(200).json({ status: "Success", results: result });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error.message });
  }
});

router.get("/contact/get", getContact);
module.exports = router;
