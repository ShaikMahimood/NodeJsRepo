# NodeJsRepo

# NodeJsTask3 folder


# creating organization, patient, file, contact crud apis with mongodb

# Folder Structure:

        app.js  //application starting point and common endpoint for all apis http://localhost:8008
        routes
            common.js   //routers for common apis
            patient.js  //routers for patient apis
            organization.js //routers for organization apis
        src
            aws
                s3.js /write upload files into aws s3 bucket and remove files code in s3.js
            patient
                controller.js   //crud operation for patient
                patient.js  //write patient schema and validation the schema
            organization
                controller.js   //crud operation for organization
                organization.js //write organization schema and validation the schema
            common
                file.js //both model & controller logic>
                utils.js   //reusable functions in utils class
            db
                mongodb.js ://all crud apis
                    exports= { addRec(), updateRec(), delRec(), listRec()}
                        getSequence() to generate sequence id 2022080100000
                        should be used in addRec.
            config  :    app.spec.json
    seed
            seedindex.js to create seed data
    temp
            to store temporary file
    postman
            postman for all apis results(postman collections)
    contact
            contact.js// contact schema, validations and add, update, remove apis for contacts

# organization api endpoint

Create All CRUD APIs:
a) POST: organization/create
b) GET: organization/get (?id, status)
c) PUT: organization/update:id
d) DELETE: organization/delete:id

# patient api endpoint

Create All CRUD APIs:
a) POST: patient/create
b) GET: patient/get (?id, status, orgid)
c) PUT: patient/update:id
d) DELETE: patient/delete:id

# file apis to upload and remove

APIs:
a) Add file: /common/uploadfile
{refid}
b) remove file
DELETE: common/deletefile/:id

# contact folder

# contant apis

    contact:
        Methods inside contact.js
                addAddress,addEmail,addFax,addPhone
                removeAddress,removeEmail,removeFax,removePhone
                updateAddress,updateEmail,updateFax,updatePhone

    API's:
    //router for organization ==> /organization/contact
    //router for patient ==> /organization/patient
        POST:  /organization/contact
        Body
        {
                __action: addAddress,
                body:{
                        refid: patientid/organizationid,
                        type,
                        subtype,
                        address
                }
        }

        {
                __action: updateAddress,
                body:{
                        id: // contact id,
                        type,
                        subtype,
                        address
                }
        }

        {
                __action: removeAddress,
                body:{
                        id
                }
        }
