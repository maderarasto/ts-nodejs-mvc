import express, { Request, Response } from 'express';

import DB from './database/DB';
import config from './config';

const app = express();

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World');
});

app.use(express.json());
app.listen(config.port, async () => {
    console.log(`App is listening on port ${config.port}...`);

    DB.init();    
});