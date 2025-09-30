import express from "express";

import { FetchLogs } from "../controllers/logs.js";

const logsRouter = express.Router();

logsRouter.get("/logs", FetchLogs);

export {logsRouter}