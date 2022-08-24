const Router = require("express");
const router = Router();

const { Validation } = require("../src/patient/patient");
const {
  createRec,
  getRec,
  updateRec,
  deleteRec,
} = require("../src/patient/controller");

const { verifyUserToken } = require('../src/middleware/auth');

const { processFun } = require("../src/common/contact");

const config = require("../src/config/app.sepc.json");

router.post("/create", verifyUserToken, Validation, createRec);

router.get("/get", verifyUserToken, getRec);

router.put("/update", verifyUserToken, updateRec);

router.delete("/delete", verifyUserToken, deleteRec);

router.post('/contact', verifyUserToken, async(req, res)=>{
  try
  {
    const __action = req.body.__action;
    const processFunction = processFun(__action);
    const contactBody = req.body.body || {};
    contactBody.refrectype = config.patient.rectype;
    const result = await processFunction(contactBody);
    res.status(200).json({ status: "Success", results: result });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
});

module.exports = router;
