# Share a meal API

[![Deploy to Heroku](https://github.com/TimothyBorghouts/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/TimothyBorghouts/programmeren-4-shareameal/actions/workflows)

## Description

This is the repository for my Share a meal API server. The API can be used by users who want to share their meals. This API contains various functionalities to provide a Share a meal application with information. This API contains, for example, users and meals that can be added, modified, viewed and deleted.

## Installation

The share a meal API can be used in 2 ways. Firstly, the share a meal api is online on a Heroku server.
[Click here to open the share a meal API on the Heroku server](https://share-a-meal-timothy-borghouts.herokuapp.com)

Secondly, it is also possible to install the share a meal server locally. This can be done by downloading the files from this repository. Then you will need Xampp and start mysql. Use a command line interface to get to the project folder and send the following texts.

`npm install`

`npm start`

## Usage

When the API is up and running you can send requests to get, change or delete data. There are several requests you can make. You will need the request, a route and sometimes information to use.

| Route             | Request |
| ----------------- | ------- |
| /api/auth/login   | POST    |
| /api/user         | POST    |
| /api/user         | GET     |
| /api/user/profile | GET     |
| /api/user/{id}    | GET     |
| /api/user/{id}    | PUT     |
| /api/user/{id}    | DELETE  |
| /api/meal         | POST    |
| /api/meal         | GET     |
| /api/meal/{id}    | GET     |
| /api/meal/{id}    | PUT     |
| /api/meal/{id}    | DELETE  |

There is documentation where you can find more information about the requests.
[Click here to open the swagger document.](https://shareameal-api.herokuapp.com/docs/)

## example

When you want to see all users you can use the following link:
[Click here to open the link](https://share-a-meal-timothy-borghouts.herokuapp.com/api/user)

You will see the results that the API sends back to you. You will get different users with different information.

```
{"statusCode":202,"results":
    [
        {"id":1,"firstName":"Mariëtte","lastName":"van den Dullemen","isActive":1,"emailAdress":"m.vandullemen@server.nl","password":"secret","phoneNumber":"","roles":"","street":"","city":""},
        {"id":2,"firstName":"John","lastName":"Doe","isActive":1,"emailAdress":"j.doe@server.com","password":"secret","phoneNumber":"06 12425475","roles":"editor,guest","street":"","city":""},
        {"id":3,"firstName":"Herman","lastName":"Huizinga","isActive":1,"emailAdress":"h.huizinga@server.nl","password":"secret","phoneNumber":"06-12345678","roles":"editor,guest","street":"","city":""},
    ]
}

```

## Tools

Various tools and libraries were used to build the Share a meal API. They are listed below.

| Tools and libraries |
| ------------------- |
| Nodejs              |
| Express             |
| Nodemon             |
| Chai                |
| Mocha               |
| Mysql               |
| jsonwebtoken        |
| Mysql               |
| Assertion server    |
| Postman             |
| Visual studio code  |
| Cmder Mini          |

## Authors and acknowledgment

- Timothy Borghouts
- Robin Schellius
- Davida Ambessi

## Project status

This Share a meal API project has been finished. Not everything has been perfectly realized but. It was a one time school project to learn about building a working API.There will be no more updates in the future.
