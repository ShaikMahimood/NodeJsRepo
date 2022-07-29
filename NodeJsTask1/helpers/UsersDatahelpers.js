import getDate from "date-and-time";
import sort from "lodash";
//parseDataJson fuction is used get expected
function parseDataJson(Obj) {
  //take an obj and set expected response from randomUsers and assign the values from functuion parameter
  const {
    gender,
    name: { title, first, last },
    email,
    phone,
    dob: { date, age },
    location: {
      street: { number, name },
      city,
      state,
      country,
      postcode,
    },
  } = Obj;
  const fullname = first + " " + last;
  const dob = getDate.format(new Date(date), "YYYY-MM-DD");
  const address = {
    line1: number,
    line2: name,
    city,
    state,
    country,
    zip: postcode,
  };
  //take the response to store expected response values
  const responseData = {
    gender,
    email,
    fullname,
    phone,
    title,
    dob,
    age,
    address,
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
export const userDataHelpers = {
  parseDataJson: parseDataJson,
  sortData: sortData,
};
