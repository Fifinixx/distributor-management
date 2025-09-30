import express from "express";

import { AddProduct, DeleteProduct } from "../controllers/products.js";

const productRouter = express.Router();

productRouter.post("/product", AddProduct);
productRouter.delete("/product", DeleteProduct);
export  {productRouter};