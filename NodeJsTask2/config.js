//create config object with reuseable params used in nodemailer transportrt
const config = {
  service: "smtp@gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "mahshaik3@gmail.com",
    pass: "tyzperabwdjeljqx",
  },
};

module.exports = config;
