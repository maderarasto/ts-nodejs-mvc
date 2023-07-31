# TypeScript Node.js MVC
The project is template for simple [Node.js](https://nodejs.org/en) application using [TypeScript](https://www.typescriptlang.org/) language. The application si based on MVC architecture within which data management is covered by [MySQL](https://www.mysql.com/) database and rendering views using [LiquidJS](https://liquidjs.com/) library.

With [LiquidJS](https://liquidjs.com/) library you can define custom views with additional helper functions that help you write view templates more easily and access to data from controller.The more information about LiquidJS you can find on its authors webiste [https://liquidjs.com](https://liquidjs.com).

**Tags**: [TypeScript](https://www.typescriptlang.org/), [Node.js](https://nodejs.org/en), [MySQL](https://www.mysql.com/), [LiquidJS](https://liquidjs.com/), Dependency Injection
## Table of contents
1. [Motivation](#motivation)
2. [State of project](#state-of-project)
3. [Configuration](#configuration)
4. [Getting started](#gettings-started)
    - [Database](#database)
    - [Models](#models)
    - [Controllers](#controllers)
    - [Services](#services)
    - [Dependency Injection Container](#dependency-injection-container)
    - [Views](#views)
    - [Error handling](#error-handling)

## Motivation
This project was created for purpose to easily create server application with API for future projects and to apply [Typescript](https://www.typescriptlang.org/) and [Node.js](https://nodejs.org/en) skills.

## State of project
#### Done
✅ Querying database with MySQL connector<br />
✅ Models with basic CRUD operations and get/set accessors based on properties<br />
✅ Using controllers with registered routes in config<br />
✅ Error handling to send error JSON (currenly not for views)<br />
✅ Rendering view templates using LiquidJS<br />
✅ Authenticating user<br />
✅ Session storage through file or databas driver<br />

#### In development
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
### Database
First you will need define environment variables in file `.env` to ensure that connection to [MySQL](https://www.mysql.com/) database can be done. Fill out `DB_HOST`, `DB_USER`, `DB_PASS` and `DB_NAME` variables:
```
# DATABASE SETTINGS
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
```
Then you can execute SQL queries using async method `execute` on object `DB`. Don't forget use `await` or to process a `Promise` to access result of execution.
```typescript
import DB, {RowData} from 'database/DB';

...

const result = await DB.execute('SELECT * FROM users') as RowData[];
...
```
When you are using parameters that you pass to SQL query, you should replace values in SQL query with symbol `?` and values then pass to second parameter, in which expects array of values as they follow each other in SQL query.
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
    await DB.rollback();
}

```
### Models
Models are objects that interact with database and each model corresponds to each database table. Models allow you easily interact with database using their methods such as finding models by their ids, saving them with current state of their data or deleting them.

#### Creating model
First you will need to craete new class for your model. The model name should by capitalized and in form of singular of model as example `class User`. Your model should also contains properties that corresponds with your table columns and their names have to be the same as your table columns. 

Each property property should has `public` access and be marked as possible undefined with symbol `?`. Also above each property should use decorator `useField()` to ensure that all properties have get/set accessors. With decorator `useField()` you can also alter setter so in example password can be hashable.

```typescript
import Mode, {useField} from './Model';

export default class extends Model {
    @useField()
    public login?: string;

    @useField('hashable')
    public password?: string;

    ...
}
```

#### Table name
In default your model class expects that the name of table is lowercased of its name and followed by letters `s` that refers to plural of that model. When there are more capitalized letters in the name of model, then each words are joined by a symbol `_`. So if we have a model class `UserToken` then we should also have a table with name `user_tokens`. 

However table name can also be overriden by your own name by overriding static member `tableName` of class `Model` like this:
```typescript
import Model from './Model';

export default class User extends Model {
    protected statit tableName: string = 'user_table';

    ...
}
```
#### Inserting data
You can insert new data with your model either creating new instance of your model with given data and then save it with method `save()` or using a static method `create(data: ModelProperties)` that will create a new instance and save data to database.

##### Fill your model with data
To fill data of your model you can set properties individually:
```typescript
const user = new User();
user.first_name = 'John';
user.last_name = 'Doe';
...
```
Or you can fill them massively using object of type `ModelProperties` and pass it as data to method `fill(data: ModelProperties)`. First you will need in your model class override a static member variable `fillable` to ensure only your defined fields can be stored. Like this:
```typescript
import Model from './Model';

export default class User extends Model {
    
    protected static fillable: string[] = [
        'first_name',
        'last_name'
    ]
    ...
}
```
And then you can use method `fill`
```typescript
const user = new User()
user.fill({
    first_name: 'John',
    // other values ...
})
```
##### Using instance method `save`
Inserting data with creating an instance, filling instance with given data and then manually saving them can be done like this:
```typescript
const user = new User()
user.fill({
    first_name: 'John',
    last_name: 'Doe'
});
await user.save();
```

##### Using static method `create`
You can insert data into table using static method `create(data: ModelProperties)` that that internally create instance, fill data with newly created instance and at the end it saves data into corresponding table. Since it's filling data massively then it is necessary set up `fillable` so it can store all your required values.
```typescript
...
User.create({
    first_name: 'John',
    last_name: 'Doe'
});
```
#### Accessing data
To access your model data you can use static methods for finding one instance with its id, find more instances with an array of ids or access all instances. If you want access specific field for your model you have to override type with keyword `as`.
```typescript
import User from './models/User';

...
// one instance
const user = await User.find(1) as User;

// many instances
const usersMany = await User.findMany([1, 2]);

// all instances
const usersAll = await User.get();
```
#### Manipulating data
You can update fields of your model or delete whole record. But you can't change `id` property because data are in corresponding tables identified by primary key`id`.
##### Update data
```typescript
...

const user = await User.find(1) as User;
user.first_name = 'Jane';
wait user.save();
```
##### Delete data
You can delete data with model by using instance method `destroy` that delete data from database but instance of model still exists.
```typescript
...
const user = User.find(1) as User;
await user.destroy();
```

Or by using static methods for deleting data by their ids with `delete(id: number)` and `deleteMany(ids: number[])`.
```typescript
// Delete one specific user
await User.delete(1);

// Delete more users
await User.deleteMany([1, 2, 3]);
```
### Controllers
When we want to trigger a function either from web or API we can use controllers. Methods of controller can be binded with routes in file `config.ts`. So when route is matched then it can trigger an action (controller's method) and run some of your code.

#### Creating your controller
First you will to create you controller class in `controllers` folder that will be extending from `class Controller` with some methods.

It is recommended to use action like this:
- get list of resources with action `index()`
- get a specific resource with action `get()`
- create a new resource with action `create()`
- update a specific resource with action `update()`
- delete a specific resource with action `delete()`

But feel free to use what works better for you.

```typescript
import { Request, Response } from 'express'
import Controller from "./Controller";

export default class IndexController extends Controller {
    async index() {
        this.response.send('<h1>Home</h1>');
    }
}
```

All controllers located in directory `controllers` are automatically loaded during app initialization. To ensure that requests are handled by appropriate controller it is necessary to bind route with controller in `config.ts` file. 

When route path is matched then controller dispatcher creates appropriate controller and dispatch action to handle incoming request. Each route needs to specified HTTP method that are using, controller key and controller action to which is route binded.

##### Controller key
Controller key is automatically generated by controller dispatcher and ked is based on combination of folders from `controllers` directory and name of controller. In example if `UserController` is located in directory `controllers/Backend/UserController.ts` then its key will be `Backend/UserController`.

##### Controller action
Controller action is name of controller method that should handle incoming request.

##### Binding routes to controller
```typescript
...
const config: AppConfig = {
    ...
    routes: [
        { 
            path: '/backend/users', 
            method: 'GET', 
            controller: 'Backend/UserController', 
            action: 'index'
        }
    ]
}
```

##### Request and Response
Each controller offers properties for accessing request data through property `request` and sending response data to user through property `response`.
###### Request
In `request` proeprty you can find information about processed request such as url, query, params, body, headers or session data.
###### Response
With `response` property you can manipulate what can be send in response. You can set up headers, cookies, content and subsequently send response with status code.
If you are using render engine you can also render template view by using method `render`.
### Services
Your business logic shouldn't be used directly in controllers so you could create your own services and then using them in your controllers.
#### Creating your service
First you need to create your service class in `services` folder that will be implmenting `interface Service` with some methods that can be ran in your controller.
```typescript
import {Service} from '../interfaces';
...
export default class UserService implements Service {
    ...
    async getUser(): Promise<User> {
        ...
        return user;
    }
}
```
#### Using your service
All services located in directory `services` are automatically loaded during app initialization. If your service class implements `interface Service` it also implements `interface Injectable` and services that are injectable can be automatically injected in your controller contructor through parameter `container: ContainerDI` or later in your actions through property `container`. 

To ensure you can use a container with automatically injected services it is necessary to add parameter `container: ContainerDI` to your contructor. And for accessing property `container` you have to pass `container` parameter to parent `class Controller` by calling parent contstructor `super(container)`.
```typescript
import Controller, {ContainerDI} from './Controller';
import {UserService} from '../services';

export default class UserController extends Controller {
    private userService: UserService;
    ...

    constructor(container: ContainerDI) {
        super(container);

        userService = container.userService as UserService;
    }

    ...

    async index() {
        this.response.render('users', await userService.getAll());
    }
}

```
### Dependency Injection Container
All components that implements `interface Injecable` are automatically injected into `ContainerDI` and components can be references by name that is pascal case format in example `UserService` can be referenced using name `container.userService`. 

If a component is namespaced with some folders then folder names are prepended in fron of component name so for example `Backend/UserService` should be referenced using name `container.backendUserService`.
### Views
For the rendering views as response from controller application uses [LiquidJS](https://liquidjs.com) template engine. [LiquidJS](https://liquidjs.com) uses own file types `.liquid` for templates that supports HTML. In template you can use many helper functions such as conditions, for loops, using variables and so on. Detailed information how to use helpers function you can find [on their website](https://liquidjs.com/tags/overview.html).
#### Rendering template file
First you will need to create a new template file in folder `views` with file type `.liquid` in example `home.liquid`.
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
  </head>
  <body>
    <h1>Home</h1>
  </body>
</html>
```
Then you can render your template file in your controller method with controller property `response` and use its method `render` to render your template file. It is necessary to pass name of your template file that you created in `views` folder.
```typescript
import Controller from "./Controller";

export default class IndexController extends Controller {
    async index() {
        this.response.render('home');
    }
}
```
### Error handling
Thrown errors are handled on level above currently processed controller so all error should be caught and currently showing placeholder error content.
