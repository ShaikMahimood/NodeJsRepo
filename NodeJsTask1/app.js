// import express and json to use express functions
import express, { json } from 'express';

// assign express function to app to use express modules
const app = express();
//import user Router from router folder
import usersRouter from './router/users.js';

//add json() middleware to use json format
app.use(json());

//Configure router so all routes are prefixed with /Users
app.use('/Users', usersRouter);

//SET the server to listen at 3000
app.listen(3000, () => console.log('Node server is running on http://localhost:3000'));