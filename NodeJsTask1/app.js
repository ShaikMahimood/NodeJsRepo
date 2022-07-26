import express, { json } from 'express';

var app = express();
import usersRouter from './router/users.js';
app.use(json());

app.use('/Users', usersRouter);

app.listen(3000, () => console.log('Node server is running on http://localhost:3000'));