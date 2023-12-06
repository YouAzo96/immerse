# immerse

## Overview

Currently Immerse has not been containerized and deployed unfortunately. However we have made the local running easy. Currently our main branch is jan_dev, not main

## Prerequistes
Please make sure you have the following installed:

- Yarn 
- NodeJS
- Git
- Mysql: We do not have the database online yet, so you will need mysql and workbench or way to interact with it.

## Installation

Once you install the prerequisites, download the repo. Inside the repo you will find an sql dump holding the schema to the database, import it in workbench or however you'd prefer. Please also update the dbconfig file in immerse/backend/envRoutes to put your mysql username and password.

Once you have finished the above step you can run the following commands into the command prompt from the root directory of the project 

npm install: This will install all the dependencies

if for any reason you get dependency error, navigate to the frontend (CD frontend) and run yarn install and the backend folder and run the command again.

Once they all download, you can run npm start (at the root of the of the project), which is set in the package.json to run all the microservices at the same time, should you wise to run them separately, the package.json file
has the commands you should run for each microservice inside of 'start:#NAMEOFMICROSERVICE'
