# phonebook-api

## Assignement

Your task is to build a RESTful API for a phone book application. Your APIs need to support an authentication method in order to secure your requests.  


Requirements 


mandatory endpoints: create, read, update, delete (feel free to extend these endpoints) 

use an authentication method to secure your requests (Examples: JWT token, oAuth, etc.) 

use a way to make your data persistent (database is preferred) 

write at least one unit test and a functional test  


We strongly recommend you use frameworks to solve the challenge if you added frameworks to your hackajob profile. Try to use good practices for the application's architecture. Extra points are given for correct use of design patterns and programming principles.  


## Setup

The project uses mysql 5.7 as a database, so make sure to have the right mysql instance running.

Edit the ormconfig.json configuration file so it has the database connection information (host, user, password, port).

## Run

first run `npm install` and then `npm run start`

## Quick overview

 - GET /phonebook/entries
 - POST /phonebook/entries
 - PUT /phonebook/entries/{id}
 - DELETE /phonebook/entries/{id}
 - POST /users/auth/signUp
 - POST /users/auth/login

The project has a very simple implementation of JWT for the authentication part (Bearer Schema).