const express = require("express");
const multer = require("multer");
const app = express();

const organization = require("./routers/organization");
const patient = require("./routers/patient");
const common = require("./routers/common");
const contact = require("./routers/contact");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/temp/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(upload.single("file"));

//Configure router so all routes are prefixed with specifix router endpoint
app.use("/organization", organization);
app.use("/patient", patient);
app.use("/common", common);
app.use("/organization/contact", contact);
app.use("/patient/contact", contact);

//SET the server to listen at 3000
app.listen(8008, () =>
  console.log("Node server is running on http://localhost:8008")
);
