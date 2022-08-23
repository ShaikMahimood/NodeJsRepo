const Router = require("express");
const router = Router();

const { Validation } = require("../src/user/user");
const {
  createRec,
  getRec,
  updateRec,
  deleteRec,
} = require("../src/user/controller");

const { setAuth, validateAuth } = require("../src/common/authentication");
const config = require("../src/config/app.sepc.json");

router.post("/create", Validation, createRec);

router.get("/get", getRec);

router.put("/update", updateRec);

router.delete("/delete", deleteRec);

router.post("/setAuth", async (req, res) => {
  try {
    req.body.refrectype = config.user.rectype;
    const result = await setAuth(req.body);
    res.status(200).json({ status: "Success", results: result });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = await validateAuth(req.body);
    res.status(200).json({ status: "Success", results: result });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
});
module.exports = router;
