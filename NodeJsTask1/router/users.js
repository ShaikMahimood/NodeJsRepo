//import express to use Router fuction
import { Router } from 'express';

//import parsingJsonData from helpers
import { userDataHelpers } from '../helpers/UsersDatahelpers.js'

//assign Router() to router variable
const router = Router();

//import usersServices from the Services to use User operations
import { usersServices } from '../Services/UsersServices.js';

//get user data from usersServices getusers function
router.get('/list', async(request,response)=>{
        const count = request.query.count || 10; //assign req query value to count
        console.log(count);
        //checking if the count is lessthan or equal to 50 or not
        if(count <= 50){
            const users = await usersServices.getUsers(count);  //get data from users services

            const data = users.results; //assign users results to data

            let userData = [];
            //loop the users data and parsing the json data
            data.forEach(userObj => {
                userData.push(userDataHelpers.parseDataJson(userObj)); //pushing each data from parseDataJson function to userData 
            });
            
            //sorting userData and update userData
            userData = userDataHelpers.sortData(userData);
            //set expected response and results
            response.status(200).json({status: 'Success',results: userData});
        }
        //if condition false than it will goes to else block and return the error
        else
            response.status(400).json({status: 'Error', message:'Users count is Must be less than and equal to 50'});
    });

export default router;