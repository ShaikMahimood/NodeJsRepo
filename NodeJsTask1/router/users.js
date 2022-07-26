import { Router } from 'express';
var router = Router();

import { Users } from '../UsersServices/UsersServices.js';

router.get('/list/:count', (request,response)=>{
    Users.getUsers(request.params.count).then(result =>{
        response.json(result);
    })
})

export default router;