const axios = require("axios");
const { getJsDateFromExcel } = require("excel-date-to-js");
const config = require("../config/app.sepc.json");

const api = "http://localhost:8008/";

const reader = require("xlsx");

//get user data from Excel file
function getUserData() {
  // Reading our Excel file
  const file = reader.readFile("../../filedata/users.xlsx");

  const users = [];

  //get excel sheetNames
  const sheets = file.SheetNames;

  //get excel sheet data, parse the data and push to users
  for (i = 0; i < sheets.length; i++) {
    const data = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    data.forEach((userObj) => {
      users.push(parseUserRecord(userObj));
    });
  }
  return users;
}

//parseUserRecord used to parse random user data
function parseUserRecord(userParams) {
  const {
    gender,
    title,
    firstname,
    lastname,
    officename,
    dob,
    age,
    email,
    phone,
    address,
  } = userParams;

  const date = getJsDateFromExcel(dob).toISOString().split("T")[0];
  const data = address.split(",");
  const addressdata = {
    line1: data[0],
    line2: data[1],
    city: data[2],
    state: data[3],
    zip: data[4],
  };

  const responseData = {
    patient: { gender, firstname, lastname, title, dob: date, age },
    contact: { email, phone, address: addressdata },
    officename,
  };
  return responseData;
}

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
    console.log(error.response.data);
  }
}

//getOrganizationRecord used to get Organization Record
async function getOrganizationRandomId(name) {
  try {
    const orgRecordInfo = await axios.get(api + "organization/get", {
      params: { name },
    });
    const orgRecordData = orgRecordInfo.data.results;
    if (orgRecordData.length) {
      const orgData = orgRecordData[0];
      return orgData.id;
    }
    const officeParams = {
      name,
      code: "Ab01",
      type: "lab",
      status: config.common.status.active,
    };
    const officeRecord = await axios.post(
      api + "organization/create",
      officeParams
    );
    const orgRecord = officeRecord.data.results;
    return orgRecord.id;
  } catch (error) {
    console.log(error);
  }
}

//createPatient used to create patient record with patient create api
async function createPatient(patientParams, officename, token) {
  try {
    patientParams.orgid = await getOrganizationRandomId(officename);
    patientParams.status = config.common.status.active;
    const patientRecord = await axios.post(
      api + "patient/create",
      patientParams,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return patientRecord.data.results;
  } catch (error) {
    console.log(error.response.data);
  }
}

//createContact used to create contact record with patient contact api
async function createContact(refid, data, token) {
  try {
    const contactRecord = [];
    if (data.address) {
      const addressParams = {
        body: {
          refid,
          type: config.contact.type.address,
          subtype: config.contact.subtype.home,
          address: data.address,
        },
        __action: "addAddress",
      };
      const contactInfo = await axios.post(
        api + "patient/contact",
        addressParams,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      contactRecord.push(contactInfo.data.results);
    }
    if (data.email) {
      const emailParams = {
        body: {
          refid,
          type: config.contact.type.email,
          subtype: config.contact.subtype.primary,
          email: data.email,
        },
        __action: "addEmail",
      };
      const contactInfo = await axios.post(
        api + "patient/contact",
        emailParams,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      contactRecord.push(contactInfo.data.results);
    }
    if (data.phone) {
      const phoneParams = {
        body: {
          refid,
          type: config.contact.type.phone,
          subtype: config.contact.subtype.mobile,
          phone: data.phone,
        },
        __action: "addPhone",
      };
      const contactInfo = await axios.post(
        api + "patient/contact",
        phoneParams,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      contactRecord.push(contactInfo.data.results);
    }
    return contactRecord;
  } catch (error) {
    console.log(error.response.data);
  }
}

//create patient record and contact record
async function start(count) {
  try {
    const userList = getUserData(count);
    const size = 1;
    const token = await getToken();
    const patientPromises = userList.map((userRecord) => {
      return processRecords(userRecord, token);
    });

    for (i = 0; i < patientPromises.length; i = i + size) {
      const recordData = patientPromises.slice(i, i * size + size);
      Promise.all(recordData).then((result) => {
        console.log(result);
      });
    }
  } catch (error) {
    console.log(error.response.data);
  }
}

//processRecords used to get create record data
function processRecords(userRecord, token) {
  return new Promise(async (resolve, reject) => {
    try {
      const patientRecord = await createPatient(
        userRecord.patient,
        userRecord.officename,
        token
      );
      const contactRecord = await createContact(
        patientRecord.id,
        userRecord.contact,
        token
      );
      resolve(contactRecord);
    } catch (error) {
      reject(error);
    }
  });
}

start();
