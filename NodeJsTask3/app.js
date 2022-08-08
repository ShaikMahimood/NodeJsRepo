const express = require("express");
const app = express();
const patient = require('./routers/patient');
const organization = require('./routers/organization')
const common = require('./routers/common');
const multipart = require('connect-multiparty');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use(multipart()) 


//Configure router so all routes are prefixed with /Users
app.use("/patient", patient);
app.use("/organization", organization);
app.use("/common", common);

//SET the server to listen at 3000
app.listen(8008, () =>
  console.log("Node server is running on http://localhost:8008")
);