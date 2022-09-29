const fs = require("fs");
const axios = require("axios");
const PDFDocument = require("pdfkit-table");

const api = "http://localhost:8008/";
// init document
async function generatePDF(patientData) {
  try {
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
    console.log(patientData);
    let doc = new PDFDocument({ margin: 30, size: "A4" });
    // save document
    doc.pipe(
      fs.createWriteStream(
        `./pdfFiles/${firstname}_${lastname}_Patient_Info.pdf`
      )
    );

    doc
      .image("./Innominds_logo.jpg", {
        fit: [50, 100],
      })
      .fontSize(15)
      .text("Patient Report", {
        fit: [50, 50],
        align: "center",
        valign: "right",
      });
    doc.moveDown(2.5);
    const table0 = {
      headers: ["Prepared For", "Requested By", "Generated On"],
      rows: [
        ["  " + officeName, "  Mahimood", "  " + new Date().toLocaleString()],
      ],
    };

    await doc.table(table0, {
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        const { x, y, width, height } = rectCell;
        // first line
        if (indexColumn === 0) {
          doc
            .lineWidth(0.5)
            .moveTo(x, y)
            .lineTo(x, y + height)
            .stroke();
        }
        doc
          .lineWidth(0.5)
          .moveTo(x + width, y)
          .lineTo(x + width, y + height)
          .stroke();
      },
    });
    doc.moveDown(2.5);
    const gender1 = gender.charAt(0).toUpperCase() + gender.slice(1);
    const table1 = {
      headers: ["Patient Info", ""],
      rows: [
        [
          "  " +
            firstname +
            "  " +
            lastname +
            "\n DOB: " +
            dob +
            " (Age: " +
            age +
            " Yrs), " +
            gender1 +
            "\n Mobile:  " +
            phone,
            " Email: " +
            email +
            "\n Address: " +
            line1 +
            ", " +
            line2 +
            ", " +
            city +
            ", " +
            state +
            ", " +
            zip +
            "\n",
        ],
      ],
    };
    await doc.table(table1, {
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        const { x, y, width, height } = rectCell;
        // first line
        if (indexColumn === 0) {
          doc
            .lineWidth(0.5)
            .moveTo(x, y)
            .lineTo(x, y + height)
            .stroke();
        }
        doc
          .lineWidth(0.5)
          .moveTo(x + width, y)
          .lineTo(x + width, y + height)
          .stroke();
      },
    });
    doc.end();
  } catch (error) {
    console.log(error);
  }
}

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

async function start(id) {
  try {
    const patientData = await getPatientData(id);
    generatePDF(patientData);
  } catch (error) {
    console.log(error);
  }
}

start(20220801003896);
