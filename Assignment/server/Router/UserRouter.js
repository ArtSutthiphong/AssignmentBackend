import express from 'express';
import { jwtPassport } from '../Util/JwtPassport.js';
import { putProfile, putPassword, patchUser, getUserbyId, getUsers } from '../controller/UserController.js';

let userRouter = express.Router();
let auth = jwtPassport();
userRouter.use(auth.initialize());

userRouter.put('/profile', auth.authenticate(), putProfile)
userRouter.put('/password', auth.authenticate(), putPassword)
userRouter.patch('/:id', auth.authenticate(), patchUser)

userRouter.get('/', getUsers)
userRouter.get('/:id', getUserbyId)
export default userRouter;

