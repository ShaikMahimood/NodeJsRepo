# NodeJsRepo
# Task1: NodeJsTask1 folder

# Task 1: 2022-07-25

1) Create a sample express project, link this to your github repository.

2) write an api to get list of users from https://randomuser.me/
    Method: Get,
    URL: localhost:3003/users/list?count=25
    Validations:
        a) throw error when count is greater than 50.
        b) default count should be 10

3) Response:
    [
        {
            id: <ssn number>,
            gender,
            title,
            fullname: <firstname> <lastname>,
            email,
            phone: phone || cell,
            dob: <YYYY-MM-DD>,
            age,
            address:{
                line1, line2, city, state, zip
            }
        }
    ]

4) sort the list in name -asc order, age: desc order

# app.js file have configuring middlewares and routers for users
# router folder have users.js In that checking Validations and getting expected response from the services
# services folder users services use to get users data from RandomUsers 
# helpers have some logic like parsing Json data and sorting the data

# Endpoint: http://localhost:3000/Users/list //for getting default(10) users data from Random users
# If you want to get no of users you entered then you can pass parameter count for no of users
# Ex Endpoint: http://localhost:3000/Users/list?count=2