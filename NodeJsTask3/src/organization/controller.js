const config = require('../config/app.sepc.json');
const { createRecord, getRecord, updateRecord, deleteRecord } = require("../common/mongodb.js");

async function createRec(req, res) {
    try {
        req.body.rectype = config.rectype.organization;
        const orginfo = await createRecord(req.body)
        console.log(orginfo)
        res.status(200).json({ status: "Success", results: orginfo });
    } catch (error) {
        console.log("Error :" + error);
        res.status(200).json({ status: "Error :", error: error });
    }
};

async function getRec(req, res) {
    try {
        const {
            query
        } = req;
        if (query.id) {
            query.id = parseInt(query.id)
        }
        const payload = query;
        console.log(payload);
        payload.rectype = config.rectype.organization;

        const data = await getRecord(payload);
        console.log(data);
        res.status(200).json({ status: "Success", results: data });
    } catch (error) {
        console.log("Error :" + error);
        res.status(200).json({ status: "Error :", error: error });
    }
}

async function updateRec(req, res) {
    try {
        const {
            query
        } = req;
        if (query.id) {
            query.id = parseInt(query.id)
        }
        const payload = query;
        payload.rectype = config.rectype.organization;
        payload.body = req.body;
        const data = await updateRecord(payload);
        res.status(200).json({ status: "Success", results: data });
    } catch (error) {
        console.log("Error :" + error);
        res.status(200).json({ status: "Error :", error: error });
    }
};
async function deleteRec(req, res) {
    try {
        const {
            query
        } = req;
        if (query.id) {
            query.id = parseInt(query.id)
        }

        const payload = query;
        console.log(payload);
        payload.rectype = config.rectype.organization;


        const data = await deleteRecord(payload);
        res.status(200).json({ status: "Success", results: data });
    } catch (error) {
        console.log("Error :" + error);
        res.status(200).json({ status: "Error :", error: error });
    }
};

module.exports = {
  createRec,
  getRec,
  updateRec,
  deleteRec,
};