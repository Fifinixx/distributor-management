import mongoose from "mongoose";
import dayjs from "dayjs";

import { OrdersModel } from "../model/orders.js";
import { ProductModel } from "../model/product.js";
import { SalesModel } from "../model/sales.js";
import { SupplierModel } from "../model/supplier.js";
import { DamageModel } from "../model/damage.js";
import { LogModel } from "../model/logs.js";

async function AddOrder(req, res, next) {
  const { supplier_id, paymentDone, products, discount, user } = req.body;
  if (!products || products.length === 0 || !user) {
    return res.status(400).json({ message: "Orders cannot be empty" });
  }
  const matchSupplier = products.find(
    (item) => item.supplier_id !== supplier_id
  );
  if (matchSupplier) {
    return res
      .status(400)
      .json({ message: "Supplier does not match its products" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orders = new OrdersModel({
      supplier_id,
      paymentDone,
      products,
      discount,
    });
    await orders.save({ session });
    for (let product of products) {
      const existingProduct = await ProductModel.findById(product.product_id);
      let newAvgPrice = product.price;
      if (existingProduct && existingProduct.avgPrice > 0) {
        const total =
          existingProduct.avgPrice * existingProduct.stock +
          product.price * product.qty;
        const newQty = Number(existingProduct.stock) + Number(product.qty);
        newAvgPrice = total / newQty;
      }
      await ProductModel.findByIdAndUpdate(
        product.product_id,
        {
          $inc: { stock: product.qty, totalCost: product.price * product.qty },
          $set: { avgPrice: newAvgPrice },
        },
        { session }
      );
      await SupplierModel.findByIdAndUpdate(
        supplier_id,
        {
          $inc: { due: Number((product.price * product.qty).toFixed(2)) },
        },
        { session }
      );
    }
    await SupplierModel.findByIdAndUpdate(
      supplier_id,
      {
        $inc: { pendingOrders: 1 },
      },
      { session }
    );
    const log = new LogModel({
      user: user,
      action: "CREATE_PURCHASE_ORDER",
      entity: "purchase",
      entityId: supplier_id,
      details: { products: products},
    });
    await log.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({ message: "Order insertion succesful" });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "purchase",
        entityId: supplier_id,
        details:{products:products},
        error: `failed to create a purchase order ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res.status(400).json({ message: "Order insertion failed" });
  }
}

async function fetchOrders(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      supplierId,
      dateSort,
      search,
      startDate,
      endDate,
      paidFilter,
      unPaidFilter,
    } = req.query;

    let query = {};

    if (supplierId) {
      query = { ...query, supplier_id: supplierId };
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
        query = { ...query, due: 0 };
      }
      if (unPaidFilter === "true") {
        query = {
          ...query,
          $expr: { $and: [{ $gt: ["$due", 0] }, { $lte: ["$due", "$total"] }] },
        };
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: ["supplier_id", "products.product_id"],
      sort: { createdAt: Number(dateSort) || -1 },
    };
    const result = await OrdersModel.paginate(query, options);
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
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function makePayment(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id, amount, user } = req.body;
    if (!id || !amount || !user ) {
      return res.status(400).json({ message: "Cannot update payment" });
    }
    const order = await OrdersModel.findById(id).session(session);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    if (Number(amount) > Number(order.due)) {
      return res.status(400).json({ message: "Payment exceeds due amount" });
    }
    // subtract from suppliers
    if (Number(amount) === Number(order.due.toString())) {
      console.log("Amount", amount);
      await SupplierModel.findByIdAndUpdate(order.supplier_id, {
        $inc: { due: -amount, pendingOrders: -1 },
      }).session(session);
    } else {
      console.log("Amount else", amount);
      await SupplierModel.findByIdAndUpdate(order.supplier_id, {
        $inc: { due: -amount },
      }).session(session);
    }
    // subtract from orders
    await OrdersModel.findByIdAndUpdate(
      id,
      { $inc: { payment: amount, due: -amount } },
      { new: true }
    ).session(session);

    const log = new LogModel({
      user: user,
      action: "MAKE_PURCHASE_PAYMENT",
      entity: "purchase",
      entityId: id,
      details: { amount: amount},
    });
    await log.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({ message: "Order has been marked as paid" });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "purchase",
        entityId: id,
        error: `failed to make purchase payment ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res.status(500).json({ message: "Failed to mark the item as paid" });
  }
}

async function DeletePurchaseOrder(req, res) {
  const { ids, user } = req.body;
  if (ids.length === 0 || !ids || !user) {
    return res.status(400).json({ message: "Invalid inputs provided" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const purchaseOrders = await OrdersModel.find({
      _id: { $in: ids },
    })
      .lean()
      .session(session);
    let orderIds = [];
    for (let order of purchaseOrders) {
      for (let product of order.products) {
        const existingSales = await SalesModel.find({
          "products.product_id": product.product_id,
        }).session(session);
        const existingDamage = await DamageModel.find({"product": product.product_id}).session(session);
        if(existingSales.length > 0 || existingDamage.length > 0){
          orderIds.push(order._id.toString())
        }
      }
    }
    const deletableOrderIds = [...new Set(ids.filter(item => !orderIds.includes(item)))];

    //substract from avg price and re-calculate
    for (let id of deletableOrderIds) {
      const purchaseOrderDoc = await OrdersModel.findById(id).session(session);
      for (let product of purchaseOrderDoc.products) {
        const productDoc = await ProductModel.findById(
          product.product_id
        ).session(session);
        const rollBackQty =
          productDoc.stock - product.qty === 0
            ? 1
            : productDoc.stock - product.qty;
        const rollBackAvgPrice =
          (productDoc.totalCost - product.total) / rollBackQty;
        await ProductModel.findByIdAndUpdate(
          product.product_id,
          {
            $inc: {
              totalCost: -product.total,
            },
            $set: {
              avgPrice: rollBackAvgPrice,
              stock: rollBackQty === 1 ? 0 : rollBackQty,
            },
          },
          { session }
        );
      }
      await SupplierModel.findByIdAndUpdate(
        purchaseOrderDoc.supplier_id,
        [
          {
            $set: {
              due: {
                $cond: {
                  if: { $gte: ["$due", purchaseOrderDoc.due] },
                  then: { $subtract: ["$due", purchaseOrderDoc.due] },
                  else: "$due",
                },
              },
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
    }
    for(let id of deletableOrderIds){
      const purchaseOrderDoc = await OrdersModel.findById(id);
      const log = new LogModel({
        user: user,
        action: "DELETE_PURCHASE_ORDER",
        entity: "purchase",
        entityId:purchaseOrderDoc.supplier_id,
        details: { products: purchaseOrderDoc.products },
      });
      await log.save({ session });
    }
    const Delete = await OrdersModel.deleteMany({
      _id: { $in: deletableOrderIds },
    }).session(session);


    await session.commitTransaction();
    await session.endSession();
    if (Delete.deletedCount !== ids.length) {
      return res.status(200).json({
        message: `Succesfully deleted ${Delete.deletedCount} ${
          Delete.deletedCount > 1 ? "orders." : "order."
        } Some items could not be deleted. Sale order or damage products exists.`,
      });
    }
    return res.status(200).json({
      message: `Succesfully deleted ${Delete.deletedCount} ${
        Delete.deletedCount > 1 ? "orders." : "order."
      }`,
    });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "purchase",
        details:{ids:ids},
        error: `failed to delete purchase order ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log("Failed to delete purchase order(s)", e);
    return res
      .status(500)
      .json({ message: "Failed to delete purchase order(s)" });
  }
}

// async function ProcessReturn(req, res, next) {
//   const { _id, products } = req.body;
//   if (!_id || products.length === 0) {
//     return res.status(400).json({ message: "Fields cannot be empty!" });
//   }

//   const session = await mongoose.startSession();
//   try {
//     await session.startTransaction();
//     const productOrders = (
//       await OrdersModel.findById(_id).session(session).lean()
//     ).products.map((item) => item);
//     for (let product of products) {
//       const purchaseProduct = productOrders.find(
//         (item) => item.product_id.toString() === product.product_id
//       );
//       if (product.qty > purchaseProduct.qty) {
//         return res.status(400).json({ message: "Return exceeds purchase" });
//       }
//     }
//     let updatedAvgPrice,
//       index = 0,
//       updatedProductOrders = [];
//     for (let product of products) {
//       const productDoc = await ProductModel.findById(
//         product.product_id
//       ).session(session);
//       if (Number(product.qty) >= 0) {
//         updatedAvgPrice =
//           (Number(productDoc.totalCost) -
//             Number(product.qty) * Number(product.price)) /
//           (Number(productDoc.stock) - Number(product.qty) === 0
//             ? 1
//             : Number(productDoc.stock) - Number(product.qty));

//         const updatedOrder = productOrders.find(
//           (item) => item.product_id.toString() === product.product_id
//         );
//         updatedProductOrders = [
//           ...updatedProductOrders,
//           {
//             ...updatedOrder,
//             qty: updatedOrder.qty - product.qty,
//             total:
//               Number(updatedOrder.price) * (updatedOrder.qty - product.qty),
//           },
//         ].filter((item) => item.qty !== 0);

//         await ProductModel.findByIdAndUpdate(product.product_id, {
//           avgPrice: updatedAvgPrice,
//           stock: productDoc.stock - product.qty,
//           totalCost:
//             Number(productDoc.totalCost) - Number(product.price) * product.qty,
//         }).session(session);

//         const grandTotal = updatedProductOrders.reduce(
//           (sum, item) => sum + (Number(item?.total) || 0),
//           0
//         );
//         if (
//           updatedProductOrders.length === 0 &&
//           index + 1 === products.length
//         ) {
//           await OrdersModel.deleteOne({ _id: _id }).session(session);
//           await SupplierModel.findByIdAndUpdate(productDoc.supplier, {
//             $inc: {
//               due: -product.qty * Number(product.price),
//               pendingOrders: -1,
//             },
//           }).session(session);
//         } else {
//           await OrdersModel.findByIdAndUpdate(_id, {
//             $set: {
//               products: updatedProductOrders,
//               grandTotal: grandTotal,
//               due: grandTotal,
//             },
//           }).session(session);
//           await SupplierModel.findByIdAndUpdate(productDoc.supplier, {
//             $inc: { due: -product.qty * Number(product.price) },
//           }).session(session);
//         }
//       }
//       index++;
//     }
//     const log = new LogModel({
//       user: user,
//       action: "RETURN_PURCHASE_ORDER",
//       entity: "purchase",
//       details: { _id:_id, products:products},
//     });
//     await log.save({ session });
//     await session.commitTransaction();
//     await session.endSession();
//     return res.json({ message: "Return updated succesfully" });
//   } catch (e) {
//     await session.abortTransaction();
//     await session.endSession();
//     try {
//       const log = new LogModel({
//         user: user,
//         action: "SYSTEM_ERROR",
//         entity: "purchase",
//         details:{ids:ids},
//         error: `failed to return purchase ${e.name || e.code}`,
//       });
//       await log.save();
//     } catch (e) {
//       console.log("Failed to save error log", e);
//     }
//     console.log(e);
//     return res
//       .status(400)
//       .json({ message: "Error while updating product return" });
//   }
// }
export {
  AddOrder,
  fetchOrders,
  makePayment,
  DeletePurchaseOrder,
  //ProcessReturn,
};
