# TypeScript NodeJS MVC
The project is template for simple NodeJS application using TypeScript language. The application si based on MVC architecture within which data management is covered by MySQL database and rendering views using LiquidJS library.

With LiquidJS library you can define custom views with additional helper functions that help you write view templates more easily and access to data from controller.The more information about LiquidJS you can find on its authors webiste [https://liquidjs.com](https://liquidjs.com).

**Tags**: Typescript, NodeJS, MySQL, LiquidJS
## Table of contents
1. [Motivation](#motivation)
2. [State of project](#state-of-project)
3. [Configuration](#configuration)
4. [Getting started](#gettings-started)

## Motivation
This project was created for purpose to easily create server application with API for future possible projects. Also for to apply Typescript and NodeJS skill.

## State of project
#### Done
✅ Querying database with MySQL connector<br />
✅ Models with basic CRUD operations and get/set accessors based on properties<br />
✅ Using controllers with registered routes in config<br />
✅ Error handling to send error JSON (currenly not for views)<br />
✅ Rendering view templates using LiquidJS<br />

#### In development
⌛ Authenticating user<br />
⌛ Adding session storage<br />
⌛ Authenticating via JWT tokens<br />
⌛ Validating input from requests<br />
⌛ Defining JSON responses based on model<br />
⌛ Defining relations between models<br />

## Configuration
This is Node.js project, so before installing [download and install latest Node.js](https://nodejs.org/en/download/current).
After installation you can install project dependencie  with command:
```bash
npm install
```
After installing dependencies you can rename file ==.env.example== to ==.env== and set up name and port of your application:
```
APP_NAME=NodeJS MVC
APP_PORT=3000
...
```

After setup you can run server application with command:
```bash
npx ts-node src/app.ts
```
or with pre-defined script ==start==
```bash
npm run start
```
## Gettings Started
### Using database

### Using Models

### Using Controllers

### Using Views
