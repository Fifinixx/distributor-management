import { AddSalesOrder, FetchSaleOrders, DeleteSalesOrder, MakeSaleOrderPayment, ProcessReturn } from "../controllers/sales.js"; 

import express from "express"

const salesRouter = express.Router();

salesRouter.get("/sales", FetchSaleOrders);
salesRouter.post("/sales", AddSalesOrder);
salesRouter.delete("/sales", DeleteSalesOrder);
salesRouter.put("/sales", MakeSaleOrderPayment);
salesRouter.put("/sales/return", ProcessReturn);
export {salesRouter}

