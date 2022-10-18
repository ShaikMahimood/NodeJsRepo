const puppeteer = require("puppeteer");
const fs = require("fs");

async function generatePDF(inputFile) {
  const data = fs.readFileSync(inputFile, "utf8");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log(data);
  await page.setContent(data);
  await page.pdf({ path: "patient.pdf", format: "A4" });
  await browser.close();
}

generatePDF("./patient.html");
