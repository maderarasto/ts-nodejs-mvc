import express, { Request, Response } from 'express';

import DB from './database/DB';
import config, { getenv } from './config';
import User from './models/User';

const app = express();

app.use(express.json());
app.listen(config.port, async () => {
    console.log(`App is listening on port ${config.port}...`);
    
    DB.init();  
    console.log(getenv('APP_NAME') + '.' + getenv('APP_POR'));

    // const u = new User();
    // u.fill({
    //     first_name: 'Rastislav',
    //     last_name: 'Madera',
    //     login: 'rmadera',
    //     password: 'abcdef'
    // });

    // console.log(u.id);

    // u.id = 12345;
    // console.log(u.id)
});    