const fetch = require("node-fetch");
const axios = require("axios");
const datechange = require("date-and-time");

const api = "http://localhost:8008/";

async function getdetails(count) {
  try {
    const users = await getUserData(count);
    const data = users.results;
    const userList = [];
    data.forEach((userObj) => {
      userList.push(parsingDataJson(userObj));
    });
    const token = await getToken();
    const patientResult = await createPatient(
      api + "patient/create",
      userList,
      token
    );
    console.log(patientResult);
  } catch (error) {
    console.log(error);
  }
}
async function getUserData(count) {
  try {
    const url = "https://randomuser.me/api/?results=";
    const res = await fetch(url + count);
    const users = await res.json();
    return users;
  } catch (error) {
    console.log(error);
  }
}

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

async function createPatient(api, userList, token) {
  return new Promise((resolve, reject) => {
    try {
      const user = userList.map((userObj) => {
        userObj.orgid = "2022080100000";
        return axios.post(api, userObj, {
          headers: { Authorization: `Bearer ${token}` },
        });
      });
      const userRecord = [];
      Promise.all(user).then((result) => {
        result.map((userData) => {
          userRecord.push(userData.data.results);
        });
        resolve(userRecord);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function parsingDataJson(userParams) {
  const {
    gender,
    name: { title, first: firstname, last: lastname },
    dob: { date, age },
  } = userParams;

  const dob = datechange.format(new Date(date), "YYYY-MM-DD");
  const responseData = {
    gender,
    firstname,
    lastname,
    title,
    dob,
    age,
  };
  return responseData;
}

getdetails(2);
