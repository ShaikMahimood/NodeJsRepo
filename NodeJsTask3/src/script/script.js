const fetch = require("node-fetch");
const axios = require("axios");
const datechange = require("date-and-time");

const config = require("../config/app.sepc.json");

const api = "http://localhost:8008/";

//getUserData is used to get random user data
async function getUserData(count) {
  try {
    const url = "https://randomuser.me/api/?results=";
    const res = await fetch(url + count);
    const users = await res.json();
    return users.results;
  } catch (error) {
    console.log(error.response.data);
  }
}

//parseUserRecord used to parse random user data
function parseUserRecord(userParams) {
  const {
    gender,
    name: { title, first: firstname, last: lastname },
    dob: { date, age },
    email,
    phone,
    location: {
      street: { number, name },
      city,
      state,
      postcode,
    },
  } = userParams;

  const address = {
    line1: number,
    line2: name,
    city,
    state,
    zip: postcode,
  };
  const dob = datechange.format(new Date(date), "YYYY-MM-DD");
  const responseData = {
    patient: { gender, firstname, lastname, title, dob, age },
    contact: { email, phone, address },
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

//getOrganizationRecord used to get Organization Record
async function getOrganizationRandomId() {
  try {
    const orgRecordInfo = await axios.get(api + "organization/get");
    const orgRecordData = orgRecordInfo.data.results;
    const orgData = await orgRecordData[
      Math.floor(Math.random() * orgRecordData.length)
    ];
    return orgData.id;
  } catch (error) {
    console.log(error);
  }
}

//createPatient used to create patient record with patient create api
async function createPatient(patientParams, token) {
  try {
    patientParams.orgid = await getOrganizationRandomId();
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

//create patient record and contact record
async function start(count) {
  try {
    const userData = await getUserData(count);
    const userList = [];
    userData.forEach((userObj) => {
      userList.push(parseUserRecord(userObj));
    });
    const token = await getToken();
    const recordData = userList.map(async (userObj) => {
      const patientRecord = await createPatient(userObj.patient, token);
      const contactRecord = await createContact(
        patientRecord.id,
        userObj.contact,
        token
      );
      return contactRecord;
    });
    Promise.all(recordData).then((result) => {
      console.log(result);
      return result;
    });
  } catch (error) {
    console.log(error);
  }
}

start(2);