import express from 'express';
import { jwtPassport } from '../Util/JwtPassport.js';
import { create, login } from '../controller/UserController.js';

let authRouter = express.Router();
let auth = jwtPassport();
authRouter.use(auth.initialize());

authRouter.post('/register', create);
authRouter.post('/login', login);

export default authRouter;