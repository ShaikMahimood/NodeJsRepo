const express = require("express");
const path = require("path");
const emailRouter = require("./router/email.js");

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

//set view engine as ejs to use ejs files
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "/views/"));

//getting index page as launching page
app.get("/", function (req, res) {
  res.render("index");
});

//use the emailRouter to roter methods
app.use("/", emailRouter);

//SET the server to listen at 3003
app.listen(3003, () => {
  console.log("Node server is running on http://localhost:3003");
});
