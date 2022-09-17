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

//getOrganizationRecord to get organization record from organization table
async function getOrganizationRecord() {
  try {
    const orgRecordInfo = await axios.get(api + "organization/get");
    const orgRecordData = orgRecordInfo.data.results;
    return orgRecordData;
  } catch (error) {
    console.log(error);
  }
}

//getOrgNameAndId to get organization name and id from organization record
async function getOrgNameAndId() {
  try {
    const orgRec = await getOrganizationRecord();
    const orgData = {};
    orgRec.map((userObj) => {
      const { name, id } = userObj;
      orgData[id] = name;
    });
    return orgData;
  } catch (error) {
    console.log(error);
  }
}

//getcontactData used to get contact for patient
async function getcontactData(token) {
  try {
    const contactRec = await axios.get(api + "patient/contact/get", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contactInfo = contactRec.data.results;
    const contactparams = {};
    contactInfo.map((userObj) => {
      const { refid, address, phone, email } = userObj;
      if (!contactparams[refid]) contactparams[refid] = {};
      if (address) contactparams[refid]["address"] = address;
      if (phone) contactparams[refid]["phone"] = phone;
      if (email) contactparams[refid]["email"] = email;
    });
    return contactparams;
  } catch (err) {
    reject(err);
  }
}

//parsingData is used to parse the patient data
function parsingData() {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getToken();
      const [patientData, contactData, orgData] = await Promise.all([
        getPatient(token),
        getcontactData(token),
        getOrgNameAndId(),
      ]);
      const dataList = patientData.map((data) => {
        const { id, orgid, gender, firstname, lastname, title, dob, age } =
          data;
        const officename = orgData[orgid];
        if (!contactData[id]) throw `contact Not Found for this patient ${id}`;
        const {
          email,
          phone,
          address: { line1, line2, city, state, zip },
        } = contactData[id];
        const addressdata =
          line1 + "," + line2 + "," + city + "," + state + "," + zip;
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
    } catch (error) {
      reject(error);
    }
  });
}

//createPatientExcelData used to upload patient record in excel sheet
async function createPatientExcelData() {
  try {
    const sheetParams = await parsingData();
    const ws = reader.utils.json_to_sheet(sheetParams);
    const file = reader.utils.book_new();
    reader.utils.book_append_sheet(file, ws, "patientData");
    reader.writeFile(file, "../../filedata/patientData.xlsx");
  } catch (error) {
    console.log(error);
  }
}

createPatientExcelData();
