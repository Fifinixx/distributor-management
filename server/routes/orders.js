import express from "express";
import {
  AddOrder,
  fetchOrders,
  makePayment,
  DeletePurchaseOrder,
 // ProcessReturn,
} from "../controllers/orders.js";

const ordersRouter = express.Router();

ordersRouter.post("/orders", AddOrder);
ordersRouter.get("/orders", fetchOrders);
ordersRouter.delete("/orders", DeletePurchaseOrder);
ordersRouter.put("/orders/payment", makePayment);
//ordersRouter.put("/orders/return", ProcessReturn)
export { ordersRouter };
