import express from 'express';
import * as mongooseDef from "mongoose";
import 'dotenv/config'
import { dbConfig } from './config/dbConfig.js';
import userRouter from './Router/UserRouter.js';
import authRouter from './Router/AuthRouter.js';

const app = express();
const port = 4000;
// entry route for root / request

let mongoose = mongooseDef.default;
mongoose.connect(dbConfig.database, dbConfig.connectOptions);
mongoose.connection.on('connected', () => console.log('Connected to database ' + dbConfig.database));
mongoose.connection.on('error', () => console.log('Database error'));

app.enable('strict routing');
app.set('strict routing', true)

app.use(express.json()); // version ^4.16

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
    res.json(req.body + process.env.DB_URL);
})

app.get('*', (req, res) => { res.status(404).json(new Error("Not Found Page!" + req.url)) })

// make server start listening on a specified port
app.listen(port, () => console.log(`Server started at port ${port}`));