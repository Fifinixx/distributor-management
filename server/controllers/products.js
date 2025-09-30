import { ProductModel } from "../model/product.js";
import { SupplierModel } from "../model/supplier.js";
import { OrdersModel } from "../model/orders.js";
import { DamageModel } from "../model/damage.js";
import { LogModel } from "../model/logs.js";
import mongoose from "mongoose";

async function AddProduct(req, res, next) {
  const { supplier, name, gst, mrp, user } = req.body;
  console.log("User", user);
  if (!supplier || !name || !gst || !mrp || !user) {
    return res.status(400).json({ message: "fields cannot be empty!" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingSupplier = await SupplierModel.findById(supplier).session(
      session
    );
    if (!existingSupplier) {
      return res.status(400).json({ message: "Supplier not found" });
    }
    const Product = new ProductModel({
      supplier: supplier,
      name: name,
      gst,
      stock: 0,
      mrp,
    });
    await Product.save({ session });
    await SupplierModel.findByIdAndUpdate(supplier, {
      $inc: { productCount: 1 },
    }).session(session);
    const log = new LogModel({
      user: user,
      action: "CREATE_PRODUCT",
      entity: "product",
      entityId: supplier,
      details: { name: name, mrp: mrp, gst: gst },
    });
    await log.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({ message: "Product insertion succesful" });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "product",
        entityId: supplier,
        error: `failed to add a product ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    if (e.name === "ValidationError") {
      return res.status(400).json({ message: e.message });
    }
    if (e.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate product, please check product name" });
    }
    if (e.name === "CastError") {
      return res.status(400).json({ message: `Invalid ${e.path}: ${e.value}` });
    }
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
}

async function DeleteProduct(req, res, next) {
  const { ids, user } = req.body;
  if (req.body.ids.length === 0) {
    return res.status(400).json({ message: "Invalid/empty ID(s)" });
  }

  // prevent deletion if orders have been made
  const puchaseReference = (
    await OrdersModel.distinct("products.product_id", {
      "products.product_id": { $in: ids },
    })
  ).map((id) => id.toString());

  const damageReference = (
    await DamageModel.distinct("product", { products: { $in: ids } })
  ).map((id) => id.toString());

  const deletableIds = [
    ...(ids.filter((item) => !puchaseReference.includes(item)) ||
      !damageReference.includes(item)),
  ];
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const supplierIds = (
      await ProductModel.find({
        _id: { $in: deletableIds },
      }).session(session)
    ).map((product) => product.supplier);
    for (let id of supplierIds) {
      await SupplierModel.findByIdAndUpdate(
        id,
        { $inc: { productCount: -1 } },
        { session }
      );
    }

    for (let id of deletableIds) {
      const productDoc = ProductModel.findById(id);
      const log = new LogModel({
        user: user,
        action: "DELETE_PRODUCT",
        entity: "product",
        entityId: productDoc.supplier,
        details: { name: productDoc.name },
      });
      await log.save({ session });
    }
    const Delete = await ProductModel.deleteMany(
      { _id: { $in: deletableIds } },
      { session }
    );

    await session.commitTransaction();
    await session.endSession();
    if (Delete.deletedCount !== ids.length) {
      return res.status(200).json({
        message: `Succesfully deleted ${Delete.deletedCount} ${
          Delete.deletedCount > 1 ? "products." : "product."
        } Some items could not be deleted. References in orders or damage.`,
      });
    }
    return res.status(200).json({
      message: `Succesfully deleted ${Delete.deletedCount} ${
        Delete.deletedCount > 1 ? "products." : "product."
      }`,
    });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "product",
        entityId: supplier,
        error: `failed to delete a product ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log("Failed to delete product(s)", e);
    return res
      .status(500)
      .json({ message: "Product(s) could not be deleted." });
  }
}
export { AddProduct, DeleteProduct };
