import express, { Request, Response } from 'express';

import DB from './database/DB';
import config from './config';
import Model from './models/Model';
import User from './models/User';

const app = express();

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World');
});

app.use(express.json());
app.listen(config.port, async () => {
    console.log(`App is listening on port ${config.port}...`);

    DB.init();    

    const u = new User({
        first_name: 'Rastislav',
        last_name: 'Madera',
    });
});    