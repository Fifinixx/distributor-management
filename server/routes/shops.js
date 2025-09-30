import express from "express"

import { FetchShops, AddShops, DeleteShops } from "../controllers/shops.js";

const shopsRouter = express.Router();

shopsRouter.get("/shops", FetchShops)
shopsRouter.post("/shops", AddShops)
shopsRouter.delete("/shops", DeleteShops)
export {shopsRouter}
