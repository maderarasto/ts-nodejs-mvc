import express from 'express';

import DB from './database/DB';
import config from './config';
import User from './models/User';

const app = express();

app.use(express.json());
app.listen(config.port, async () => {
    console.log(`App is listening on port ${config.port}...`);
    
    DB.init();

    const u = await User.find(1);
    console.log(u?.destroy());
});    