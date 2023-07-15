# TypeScript Node.js MVC
The project is template for simple [Node.js](https://nodejs.org/en) application using [TypeScript](https://www.typescriptlang.org/) language. The application si based on MVC architecture within which data management is covered by [MySQL](https://www.mysql.com/) database and rendering views using [LiquidJS](https://liquidjs.com/) library.

With [LiquidJS](https://liquidjs.com/) library you can define custom views with additional helper functions that help you write view templates more easily and access to data from controller.The more information about LiquidJS you can find on its authors webiste [https://liquidjs.com](https://liquidjs.com).

**Tags**: [TypeScript](https://www.typescriptlang.org/), [Node.js](https://nodejs.org/en), [MySQL](https://www.mysql.com/), [LiquidJS](https://liquidjs.com/)
## Table of contents
1. [Motivation](#motivation)
2. [State of project](#state-of-project)
3. [Configuration](#configuration)
4. [Getting started](#gettings-started)

## Motivation
This project was created for purpose to easily create server application with API for future possible projects. Also for to apply [Typescript](https://www.typescriptlang.org/) and [Node.js](https://nodejs.org/en) skill.

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
This is [Node.js](https://nodejs.org/en) project, so before installing [download and install latest Node.js](https://nodejs.org/en/download/current).
After installation you can install project dependencie  with command:
```bash
npm install
```
After installing dependencies you can rename file `.env.example` to `.env` and set up name and port of your application:
```
APP_NAME=NodeJS MVC
APP_PORT=3000
...
```

After setup you can run server application with command:
```bash
npx ts-node src/app.ts
```
or with pre-defined script `start`
```bash
npm run start
```
## Gettings Started
### Using database
First you will need enter environment variables in file `.env` to ensure that connection to [MySQL](https://www.mysql.com/) database can be done. Fill out `DB_HOST`, `DB_USER`, `DB_PASS` and `DB_NAME`:
```
# DATABASE SETTINGS
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
```
Then you can execute SQL queries using async method `execute` on object `DB`. Don't forget use `await` or process `Promise` to access result of execution.
```typescript
import DB, {RowData} from 'database/DB';

...

const result = await DB.execute('SELECT * FROM users') as RowData[];
...
```
When you are using parameters passign to SQL query, you should in SQL query instead of values use `?` and values then pass to second parameter, in which expects array of values as they follow each other in SQL query.
```typescript
import DB, {ResultSetHeader} from 'database/DB';

...
const result = await DB.execute(`
    INSERT INTO users (first_name, last_name, login, password)
    VALUES (?, ?, ?, ?)
`, [firstName, lastName, login, password]) as ResultSetHeader;
...
```
With DB you can also begin, commit and rollback database transactions. You can use it like this:
```typescript
import DB from 'database/DB';

...
try {
    await DB.beginTransaction();

    ...
    await DB.commit();
} catch {
    DB.rollback();
}

```
### Using Models

### Using Controllers

### Using Views
