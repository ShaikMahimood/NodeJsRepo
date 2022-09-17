const fetch = require("node-fetch");

//getUsers async function is used to get data from Randomuser
async function getUsers(count) {
  // fetch is uesd to get the data from random user
  const users = await fetch("https://randomuser.me/api/?results=" + count); //count is used to get No of User from RandomUsers
  return users.json(); //users data converted into json format
}

//export the usersServices
module.exports = {
  getUsers
};
