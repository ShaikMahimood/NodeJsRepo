const Router = require("express");
const router = Router();

const { Validation } = require("../src/user/user");
const {
  createRec,
  getRec,
  updateRec,
  deleteRec,
} = require("../src/user/controller");

const { setAuth } = require("../src/authentication/authentication");
const config = require("../src/config/app.sepc.json");

router.post("/create", Validation, createRec);

router.get("/get", getRec);

router.put("/update", updateRec);

router.delete("/delete", deleteRec);

router.post("/authentication", async (req, res) => {
  try {
    req.body.refrectype = config.user.rectype;
    const result = await setAuth(req.body);
    console.log(result);
    res.status(200).json({ status: "Success", results: result });
  } catch (error) {
    res.status(400).json({ status: "Error :", error: error });
  }
});

module.exports = router;
