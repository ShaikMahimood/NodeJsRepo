const getDate = require("date-and-time");
const sort = require("lodash");
//parseDataJson fuction is used get expected
function parseDataJson(Obj) {
  //take an obj and set expected response from randomUsers and assign the values from functuion parameter
  const {
    gender,
    name: { title, first, last },
    // email,
    // phone,
    dob: { date, age },
    // location: {
    //   street: { number, name },
    //   city,
    //   state,
    //   country,
    //   postcode,
    // },
  } = Obj;
  const dob = getDate.format(new Date(date), "YYYY-MM-DD");
  // const address = {
  //   line1: number,
  //   line2: name,
  //   city,
  //   state,
  //   country,
  //   zip: postcode,
  // };
  //take the response to store expected response values
  const responseData = {
    gender,
    first,
    last,
    title,
    dob,
    age,
  };
  //return the responseData
  return responseData;
}

//sortData function is use to sort age in descending and name in ascending order
function sortData(users) {
  sort.orderBy(users, ["fullname", "age"], ["asc", "desc"]);
  return users;
  //console.log(users);
}

//export the function parseDataJson, sortData;
module.exports = {
  parseDataJson,
  sortData
};
