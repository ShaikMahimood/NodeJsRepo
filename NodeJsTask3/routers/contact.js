const Router = require("express");
const router = Router();

const { validation } = require("../src/contact/contact");
const {
  addcontact,
  updatecontact,
  removecontact,
} = require("../src/contact/controller");

router.post("/addcontact", validation, addcontact);

router.put("/updatecontact", validation, updatecontact);

router.delete("/removecontact", removecontact);

module.exports = router;
