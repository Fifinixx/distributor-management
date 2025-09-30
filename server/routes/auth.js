import express from "express";

import { Login, Signout } from "../controllers/auth.js";
const authRouter = express.Router();

authRouter.post('/login',Login);
authRouter.post('/signout',Signout);

export  {authRouter};