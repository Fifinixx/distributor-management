import express from "express";

import { RecordDamage } from "../controllers/damage.js";

const damageRouter = express.Router()

damageRouter.post("/damage", RecordDamage);

export {damageRouter};