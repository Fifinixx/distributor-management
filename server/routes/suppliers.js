import express from "express"

import { FetchSuppliers, AddSuppliers, DeleteSuppliers } from "../controllers/suppliers.js"

const suppliersRouter = express.Router();

suppliersRouter.get("/suppliers", FetchSuppliers);
suppliersRouter.post("/suppliers", AddSuppliers);
suppliersRouter.delete("/suppliers",DeleteSuppliers);

export {suppliersRouter}