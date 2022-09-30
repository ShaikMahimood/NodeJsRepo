const puppeteer = require("puppeteer");

const fs = require("fs-extra");

const hbs = require("handlebars");

const path = require("path");

const axios = require("axios");
const api = "http://localhost:8008/";

async function getPatientData(id) {
  try {
    const patientDetails = await axios.get(api + "patient/details", {
      params: { id: id },
    });
    return patientDetails.data.results;
  } catch (error) {
    console.log(error);
  }
}

async function compile(templateName, patientData) {
  const filePath = path.join(process.cwd(), `${templateName}.hbs`);
  const html = await fs.readFile(filePath, "utf8");
  console.log(html);
  return hbs.compile(html)(patientData);
}
async function generatePDF(patientId) {
  const patientData = await getPatientData(patientId);
  const dateCreated = new Date().toLocaleString();
  const {
    id,
    title,
    firstname,
    lastname,
    dob,
    age,
    gender,
    orgid,
    officeName,
    status,
    createdBy,
    created,
    email,
    phone,
    address: { line1, line2, city, state, zip },
  } = patientData;
  patientData.dateCreated = dateCreated;

  patientData.gender = gender.charAt(0).toUpperCase() + gender.slice(1);

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log(patientData);
    const content = await compile("patient", patientData);
    console.log(content);
    await page.setContent(content);
    await page.pdf({
      path: `./pdfFiles/${firstname}_${lastname}_Patient_Info.pdf`,
      format: "A4",
      printBackground: true,
    });
    console.log("done creating pdf");
    await browser.close();
    process.exit();
  } catch (e) {
    console.log(e);
  }
}

generatePDF(20220801003896);
