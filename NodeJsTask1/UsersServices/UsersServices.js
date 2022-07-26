import { json } from 'express';
import fetch from 'node-fetch';

async function getUsers(count) {
    if (count === undefined) {
        count = 10;
      }
    if(count <= 50){
        const users = await fetch("https://randomuser.me/api/?results="+count);
            return users.json();
    }
    return 'Users count is Must be less than and equal to 50';
}
    

export const Users = {
    getUsers: getUsers
};