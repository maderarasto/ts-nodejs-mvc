import express, { Request, Response } from 'express';

const app = express();

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World');
});

app.listen(3000);