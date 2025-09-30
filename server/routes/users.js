import express from "express"

import { FetchUsers, Signup } from "../controllers/users.js";

const usersRouter = express.Router();

usersRouter.get("/users", FetchUsers);
usersRouter.post("/users/signup", Signup);

export {usersRouter}