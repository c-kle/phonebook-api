# phonebook-api

## Assignement

Your task is to build a RESTful API for a phone book application. Your APIs need to support an authentication method in order to secure your requests.  


Requirements 


mandatory endpoints: create, read, update, delete (feel free to extend these endpoints) 

use an authentication method to secure your requests (Examples: JWT token, oAuth, etc.) 

use a way to make your data persistent (database is preferred) 

write at least one unit test and a functional test  


We strongly recommend you use frameworks to solve the challenge if you added frameworks to your hackajob profile. Try to use good practices for the application's architecture. Extra points are given for correct use of design patterns and programming principles.  

## Run

### with docker and docker-compose

- First, rename the `.env.default` file into `.env`
- Then run `sh scripts/docker-start.sh`

### or without docker

- Make sure to have a redis and mysql5.7 instance running
- Edit the `.env.default` *(do not rename it !)* file's content so that the following variables have the right value.

```
TYPEORM_HOST=             /// mysql host
TYPEORM_USERNAME=         /// mysql username
TYPEORM_PASSWORD=         /// mysql password
TYPEORM_DATABASE=         /// mysql database
REDIS_URL=                /// redis connection string
```

- Run `npm install`
- Run `npm run start`

## Quick overview

- GET /api/phonebook/entries
- POST /api/phonebook/entries `(*)`
- PUT /api/phonebook/entries/{id} `(*)`
- DELETE /api/phonebook/entries/{id} `(*)`
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/logout `(*)`
- POST /api/auth/token/{userId}

`(*): bearer token required`

The project has a very simple implementation of JWT for the authentication part (Bearer Schema).