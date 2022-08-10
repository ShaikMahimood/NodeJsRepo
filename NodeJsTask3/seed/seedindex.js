const { createRecord } = require('../src/db/mongodb');
const patientdata = [{

        "rectype": "patient",
        "firstname": "budhuru",
        "lastname": "reddy",
        "nickname": "honey",
        "gender": "female",
        "dob": "26/09/1995",
        "language": "telugu",
        "status": "active"
    },
    {

        "rectype": "patient",
        "firstname": "ram",
        "lastname": "reddy",
        "nickname": "honey",
        "gender": "male",
        "dob": "06/09/1986",
        "language": "telugu",
        "status": "active"
    }

]
const organization = [{
        "rectype": "organization",
        "code": "CH",
        "name": "sri sai",
        "type": "clinic",
        "status": "active"
    },
    {
        "rectype": "organization",
        "code": "ALP",
        "name": "gv diagnostic centre",
        "type": "lab",
        "status": "active",
    }
]
async function addpatient() {
    for (i = 0; i < patientdata.length; i++)
        await createRecord(patientdata[i])
}
async function addorganization() {
    for (i = 0; i < organization.length; i++)
        await createRecord(organization[i])
}
addpatient();
addorganization();