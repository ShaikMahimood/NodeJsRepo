const axios = require("axios");
const config = require("../config/app.sepc.json");

const api = "http://localhost:8008/";

const reader = require("xlsx");

//get user data from Excel file
function getUserData() {
  // Reading our Excel file
  const file = reader.readFile("../../filedata/patient.xlsx");

  const users = [];

  //get excel sheetNamess
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
    title,
    firstname,
    lastname,
    gender,
    officename,
    dob,
    age,
    email,
    phone,
    address,
  } = userParams;

  const [line1, line2, city, state, zip] = address.split(",");
  const addressdata = {
    line1,
    line2,
    city,
    state,
    zip,
  };
  const responseData = {
    patient: { title, firstname, lastname, gender, dob, age },
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
    reject(error);
  }
}

//createOrganization to create organization record
async function createOrganization(name) {
  try {
    const officeParams = {
      name,
      code: name.replace(/\s+/g, "_").toLowerCase(),
      type: config.organization.type[
        Math.floor(Math.random() * config.organization.type.length)
      ],
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

//getOrgNameAndId to get organization name and id from organization record
async function getOrgNameAndId(users) {
  try {
    const office = [];
    users.map((userObj) => {
      if (!office.includes(userObj.officename)) {
        office.push(userObj.officename);
      }
    });
    const orgRec = await getOrganizationRecord();
    const orgData = [];
    orgRec.map((userObj) => {
      const { name, id } = userObj;
      orgData.push({ name, id });
    });
    office.map(async (name) => {
      const Data = orgData.find((x) => x.name === name);
      if (!Data) {
        const id = await createOrganization(name);
        orgData.push({ id, name });
      }
    });
    return orgData;
  } catch (error) {
    console.log(error);
  }
}

//createPatient to create patient in database
async function createPatient(patientParams, orgid, token) {
  try {
    patientParams.orgid = orgid;
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
    console.log(error);
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
    console.log(error);
  }
}

//processRecords used to get create record data
function processRecords(userRecord, officeData, token) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = officeData.find((x) => x.name == userRecord.officename);
      const patientRecord = await createPatient(
        userRecord.patient,
        data.id,
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

//create patient record and contact record
async function start() {
  try {
    const userList = getUserData();
    const size = 5;
    const token = await getToken();
    const officeData = await getOrgNameAndId(userList);
    const patientPromises = userList.map((userRecord) => {
      return processRecords(userRecord, officeData, token);
    });

    for (i = 0; i < patientPromises.length; i = i + size) {
      const recordData = patientPromises.slice(i, i + size);
      Promise.all(recordData).then((result) => {
        return result;
      });
    }
  } catch (error) {
    console.log(error);
  }
}

start();
