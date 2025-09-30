import express from "express"

import { FetchPerformance } from "../controllers/performance.js"

const performanceRouter = express.Router()


performanceRouter.get("/performance", FetchPerformance)

export {performanceRouter}