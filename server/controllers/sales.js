import mongoose from "mongoose";

import { SalesModel } from "../model/sales.js";
import { ProductModel } from "../model/product.js";
import { ShopsModel } from "../model/shops.js";
import { LogModel } from "../model/logs.js";
import dayjs from "dayjs";

async function AddSalesOrder(req, res, next) {
  const { shop_id, products, user } = req.body;
  if (!products || products.length === 0 || !shop_id || !user) {
    return res.status(400).json({ message: "Orders cannot be empty" });
  }
  const matchSupplier = products.find((item) => item.shop_id !== shop_id);
  if (matchSupplier) {
    return res.status(400).json({ message: "Cannot have multiple shops" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orders = new SalesModel({ shop_id, products });
    await orders.save({ session });
    for (let product of products) {
      await ProductModel.findByIdAndUpdate(
        product.product_id,
        { $inc: { stock: -product.qty } },
        { session }
      );
    }
    const grandTotal = products.reduce((sum, product) => {
      return sum + Number(product.total);
    }, 0);
    await ShopsModel.findByIdAndUpdate(shop_id, {
      $inc: { due: Number(grandTotal).toFixed(2), pendingOrders: 1 },
    });
    const log = new LogModel({
      user: user,
      action: "CREATE_SALE_ORDER",
      entity: "sales",
      entityId: shop_id,
      details: { products: products },
    });
    await log.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({ message: "Sale order creation succesful" });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "sales",
        details: { ids: ids },
        error: `failed to add sale order ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res.status(400).json({ message: "Sale order creation failed" });
  }
}

async function FetchSaleOrders(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      shop_id,
      dateSort,
      search,
      startDate,
      endDate,
      paidFilter,
      unPaidFilter,
      paginate = true,
    } = req.query;
    let query = {};
    if (shop_id) {
      query = { ...query, shop_id: shop_id };
    }
    if (search) {
      query = { ...query, name: { $regex: search, $options: "i" } };
    }
    if (dayjs(startDate).isValid() && dayjs(endDate).isValid()) {
      const startingDate = dayjs(startDate, "D/M/YYYY").startOf("day").toDate();
      const endingDate = dayjs(endDate, "D/M/YYYY").endOf("day").toDate();
      query = { ...query, createdAt: { $gte: startingDate, $lte: endingDate } };
    }

    if (!(paidFilter === "true" && unPaidFilter === "true")) {
      if (paidFilter === "true") {
        query = { ...query, $expr: { $and: [{ $lte: ["$due", "$total"] }] } };
      }
      if (unPaidFilter === "true") {
        query = {
          ...query,
          $expr: { $and: [{ $gte: ["$due", "$total"] }] },
        };
      }
    }

    const options = {
      pagination: paginate === "false" ? false : true,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: [
        { path: "shop_id" },
        { path: "products.product_id" },
        { path: "products.supplier_id" },
      ],
      sort: { createdAt: Number(dateSort) || -1 },
    };
    const result = await SalesModel.paginate(query, options);
    return res.json({
      orders: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      totalDocs: result.totalDocs,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch sale orders" });
  }
}

async function MakeSaleOrderPayment(req, res, next) {
  try {
    const { id, amount } = req.body;
    if (!id || !amount || amount < 0) {
      return res.status(400).json({ message: "Cannot update payment" });
    }
    const order = await SalesModel.findById(id);
    if (!order) {
      return res.status(400).json({ message: "Sale Order not found" });
    }

    if (Number(amount) === Number(order.due.toString())) {
      await ShopsModel.findByIdAndUpdate(order.shop_id, {
        $inc: { due: -amount, pendingOrders: -1 },
      });
    } else {
      await ShopsModel.findByIdAndUpdate(order.shop_id, {
        $inc: { due: -amount },
      });
    }
    await SalesModel.findByIdAndUpdate(id, {
      $inc: { payment: amount, due: -amount },
    });

    const log = new LogModel({
      user: user,
      action: "MAKE_SALE_PAYMENT",
      entity: "sales",
      entityId: id,
      details: { amount: amount },
    });
    await log.save({ session });
    return res
      .status(200)
      .json({ message: "Sale Order has been marked as paid" });
  } catch (e) {
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: id,
        details: { amount: amount },
        error: `failed to make sales payment ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res
      .status(400)
      .json({ message: "Failed to mark the sale order as paid" });
  }
}

async function DeleteSalesOrder(req, res) {
  const { ids, user } = req.body;
  if (ids.length === 0 || !ids || ids.includes(null) || !user) {
    return res.status(400).json({ message: "No/invalid ID's provided" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  let deletedCount = 0;
  try {
    for (let id of ids) {
      const saleOrder = await SalesModel.findById(id).session(session);
      if (Number(saleOrder.payment) === 0) {
        await ShopsModel.findByIdAndUpdate(
          saleOrder.shop_id,
          [
            {
              $set: {
                due: { $subtract: ["$due", saleOrder.due] },
                pendingOrders: {
                  $cond: {
                    if: { $gt: ["$pendingOrders", 0] },
                    then: { $subtract: ["$pendingOrders", 1] },
                    else: "$pendingOrders",
                  },
                },
              },
            },
          ],
          { session }
        );
        const log = new LogModel({
          user: user,
          action: "DELETE_SALE_ORDER",
          entity: "sales",
          entityId: saleOrder.shop_id,
          details: { products: saleOrder.products },
        });
        await log.save({ session });
        for (let product of saleOrder.products) {
          await ProductModel.findByIdAndUpdate(product.product_id, {
            $inc: { stock: product.qty },
          }).session(session);
        }
        await SalesModel.deleteOne({ _id: id }).session(session);
        deletedCount++;
      }
    }
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({
      message: `Succesfully deleted ${deletedCount} ${
        deletedCount > 1 ? "sale orders." : "sale order."
      }`,
    });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "sales",
        details: { ids: ids },
        error: `failed to delete sales order(s) ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log("Failed to delete sale order(s)", e);
    return res.status(500).json({ message: "Failed to delete sale order(s)" });
  }
}

async function ProcessReturn(req, res, next) {
  const { _id, products, user } = req.body;
  if (!_id || products.length === 0 || !user) {
    return res.status(400).json({ message: "Fields cannot be empty!" });
  }
  const session = await mongoose.startSession();
  try {
    let updatedSaleProducts = [];
    await session.startTransaction();
    const salesOrderDoc = await SalesModel.findById(_id)
      .session(session)
      .lean();
    for (let product of products) {
      if (product.qty > 0) {
        const productDoc = await ProductModel.findById(
          product.product_id
        ).session(session);
        const updatedStock = Number(productDoc.stock) + Number(product.qty);
        await ProductModel.findByIdAndUpdate(product.product_id, {
          $set: { stock: updatedStock },
        }).session(session);
      }
      const updateSaleProduct = salesOrderDoc.products.find(
        (item) => item.product_id.toString() === product.product_id
      );
      updatedSaleProducts = [
        ...updatedSaleProducts,
        {
          ...updateSaleProduct,
          qty: Number(updateSaleProduct.qty) - Number(product.qty),
          total:
            Number(updateSaleProduct.total) -
            Number(product.price) * Number(product.qty),
        },
      ].filter((item) => item.total !== 0);
    }

    if (updatedSaleProducts.length !== 0) {
      const grandTotal = updatedSaleProducts.reduce(
        (sum, item) => sum + item.total,
        0
      );

      await SalesModel.findByIdAndUpdate(_id, {
        $set: {
          products: updatedSaleProducts,
          grandTotal: grandTotal,
          due:
            Number(salesOrderDoc.due) === salesOrderDoc.payment
              ? 0.0
              : salesOrderDoc.due < 0
              ? Number(salesOrderDoc.due) + grandTotal
              : Number(salesOrderDoc.due) -
                (Number(salesOrderDoc.due) - grandTotal),
        },
      }).session(session);
      await ShopsModel.findByIdAndUpdate(salesOrderDoc.shop_id, {
        $set: {
          due:
            Number(salesOrderDoc.due) === salesOrderDoc.payment
              ? 0.0
              : salesOrderDoc.due < 0
              ? Number(salesOrderDoc.due) + grandTotal
              : Number(salesOrderDoc.due) -
                (Number(salesOrderDoc.due) - grandTotal),
        },
      }).session(session);
      const log = new LogModel({
        user: user,
        action: "RETURN_SALE_ORDER",
        entity: "sales",
        entityId: _id,
        details: { products: products },
      });
      await log.save({ session });
    } else {
      await SalesModel.deleteOne({ _id: _id }).session(session);
      await ShopsModel.findByIdAndUpdate(salesOrderDoc.shop_id, {
        $set: {
          due:
            Number(salesOrderDoc.due) === salesOrderDoc.payment
              ? 0.0
              : salesOrderDoc.due < 0
              ? Number(salesOrderDoc.due) + grandTotal
              : Number(salesOrderDoc.due) -
                (Number(salesOrderDoc.due) - grandTotal),
        },
      }).session(session);
    }
    await session.commitTransaction();
    await session.endSession();
    return res.json({ message: "Sales return adjusted succesfully!" });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "sales",
        details: { id: _id },
        error: `failed to return sales order(s) ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res.status(400).json({ message: "Failed to update sales return." });
  }
}
export {
  AddSalesOrder,
  FetchSaleOrders,
  MakeSaleOrderPayment,
  DeleteSalesOrder,
  ProcessReturn,
};
