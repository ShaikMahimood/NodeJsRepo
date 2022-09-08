const axios = require("axios");
const config = require("../config/app.sepc.json");

const api = "http://localhost:8008/";

const reader = require("xlsx");

//get token from user data
async function getToken() {
  try {
    const user = {
      username: "MahiShaik",
      password: "Mahi@123",
    };
    const tokenInfo = await axios.post(api + "user/login", user);
    return tokenInfo.data.results;
  } catch (error) {
    console.log(error);
  }
}

//getPatient used to get patient data from database
async function getPatient(token) {
  try {
    const patientRecord = await axios.get(api + "patient/get", {
      params: { status: config.common.status.active },
      headers: { Authorization: `Bearer ${token}` },
    });
    const patientData = patientRecord.data.results;
    return patientData;
  } catch (error) {
    console.log(error);
  }
}

//getOfficename used to get officename from orgid
async function getOfficename(id) {
  try {
    const officeRecord = await axios.get(api + "organization/get", {
      params: { id, status: config.common.status.active },
    });
    const officeData = officeRecord.data.results;
    return officeData[0].name;
  } catch (error) {
    console.log(error);
  }
}

//getPatientContact used to get conatct record for patient
async function getPatientContact(refid, token) {
  try {
    const contactRecord = await axios.get(api + "patient/contact/get", {
      params: { refid },
      headers: { Authorization: `Bearer ${token}` },
    });
    const contactdata = {};
    const contactData = contactRecord.data.results;
    if (contactData.length) {
      contactData.map((data) => {
        if (data.address) contactdata["address"] = data.address;
        if (data.email) contactdata["email"] = data.email;
        if (data.phone) contactdata["phone"] = data.phone;
      });
    }
    return contactdata;
  } catch (error) {
    console.log(error);
  }
}

//parsingData is used to parse the patient data
async function parsingData() {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getToken();
      const patientData = await getPatient(token);
      if (patientData.length) {
        const dataList = patientData.map(async (data) => {
          const { id, orgid, gender, firstname, lastname, title, dob, age } =
            data;
          const officename = await getOfficename(orgid);
          const contactData = await getPatientContact(id, token);
          const { email, phone, address } = contactData;

          const addressdata =
            address.line1 +
            "," +
            address.line2 +
            "," +
            address.city +
            "," +
            address.state +
            "," +
            address.zip;
          const dataParams = {
            title,
            firstname,
            lastname,
            officename,
            dob,
            age,
            gender,
            address: addressdata,
            email,
            phone,
          };
          return dataParams;
        });
        Promise.all(dataList).then((data) => {
          resolve(data);
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

//createPatientExcelData used to upload patient record in excel sheet
async function createPatientExcelData() {
  try {
    const sheetParams = await parsingData();
    console.log(sheetParams);
    const ws = reader.utils.json_to_sheet(sheetParams);
    const file = reader.utils.book_new();
    reader.utils.book_append_sheet(file, ws, "patientData");

    reader.writeFile(file, "../../filedata/patient.xlsx");
  } catch (error) {
    console.log(error);
  }
}

createPatientExcelData();