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

//parsingData is used to parse the patient data
async function parsingData() {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getToken();
      const patientData = await getPatient(token);
      const contactData = await getcontactData(token);
      if (patientData.length) {
        const orgData = await getOrgNameAndId(patientData);
        const dataList = patientData.map(async (data) => {
          const { id, orgid, gender, firstname, lastname, title, dob, age } =
            data;
          const officedata = orgData.find((x) => x.id == orgid);
          const officename = officedata.name;
          if (!contactData.hasOwnProperty(id))
            throw `contact Not Found for this patient ${id}`;
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
      }
    } catch (error) {
      reject(error);
    }
  });
}

//getOrgNameAndId used to get organization name and id from organization record
async function getOrgNameAndId(users) {
  return new Promise((resolve, reject) => {
    try {
      const officeid = [];
      users.map((user) => {
        if (!officeid.includes(user.orgid)) officeid.push(user.orgid);
      });
      const officeData = officeid.map(async (id) => {
        const name = await getOfficename(id);
        if (name) return { name, id };
      });
      Promise.all(officeData).then((data) => {
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
}

//getcontactData used to get contact for patient 
async function getcontactData(token) {
  try {
    const contactRec = await axios.get(api + "patient/contact/get", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contactInfo = contactRec.data.results;
    var contactparams = {};
    if (contactInfo.length) {
      contactInfo.map((userObj) => {
        if (!contactparams.hasOwnProperty(userObj.refid))
          contactparams[userObj.refid] = {};
        if (Object.keys(contactparams).includes(userObj.refid))
          if (userObj.address)
            contactparams[userObj.refid]["address"] = userObj.address;
          else if (userObj.phone)
            contactparams[userObj.refid]["phone"] = userObj.phone;
          else if (userObj.email)
            contactparams[userObj.refid]["email"] = userObj.email;
      });
    }
    return contactparams;
  } catch (err) {
    console.log(err);
  }
}

//createPatientExcelData used to upload patient record in excel sheet
async function createPatientExcelData() {
  try {
    const sheetParams = await parsingData();
    const ws = reader.utils.json_to_sheet(sheetParams);
    const file = reader.utils.book_new();
    reader.utils.book_append_sheet(file, ws, "patientData");
    reader.writeFile(file, "../../filedata/patient.xlsx");
  } catch (error) {
    console.log(error);
  }
}

createPatientExcelData();
