import express from "express";

import { Inventory } from "../controllers/inventory.js";

const inventoryRouter = express.Router();

inventoryRouter.get("/inventory", Inventory);

export  {inventoryRouter};