import { SupplierModel } from "../model/supplier.js";
import mongoose from "mongoose";
import { LogModel } from "../model/logs.js";
async function FetchSuppliers(req, res, next) {
  const { search, page, limit, paginate } = req.query;
  try {
    let query = {};
    if (search) {
      query = { ...query, name: { $regex: search, $options: "i" } };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      paginate: paginate,
    };
    if (paginate === "true") {
      const result = await SupplierModel.paginate(query, options);
      return res.json({
        suppliers: result.docs,
        totalPages: result.totalPages,
        currentPage: result.page,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } else {
      const result = await SupplierModel.find({});
      return res.json({ suppliers: result });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Failed to fetch suppliers" });
  }
}

async function AddSuppliers(req, res, next) {
  const session = await mongoose.startSession()
  const { name, user } = req.body;
  if (!name || !user) {
    return res.status(400).json({ message: "Supplier name is required" });
  }
  try {
    await session.startTransaction();
    const Supplier = new SupplierModel({ name });
    await Supplier.save({session});
    const log = new LogModel({
      user: user,
      action: "CREATE_SUPPLIER",
      entity: "supplier",
      details: { name: name },
    });
    await log.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({ message: "Succesfully added a supplier" });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "supplier",
        details: { name: name },
        error: `failed to add supplier ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res.status(500).json({ message: "Failed to add supplier" });
  }
}

async function DeleteSuppliers(req, res, next) {
  const { ids, user } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction()
    for (let id of ids) {
      if (!id) {
        return res
          .status(400)
          .json({ message: "Invalid supplier ID(s) provided" });
      }
    }
    if(!user){
      return res
      .status(400)
      .json({ message: "Invalid user provided" });
    }

    const log = new LogModel({
      user: user,
      action: "DELETE_SUPPLIER",
      entity: "supplier",
      details: { id: ids[0] },
    });
    await log.save({ session });

    const Delete = await SupplierModel.deleteMany({
      _id: { $in: ids },
      due: { $eq: 0 },
      productCount:{$eq: 0},
      pendingOrders:{$eq: 0},
    }).session(session);
    if (Delete.deletedCount !== ids.length) {
      return res.status(200).json({
        message: `Succesfully deleted ${Delete.deletedCount} ${
          Delete.deletedCount > 1 ? "suppliers." : "supplier."
        } Some suppliers could not be deleted. Please remove any entries purchase/sales and try again.`,
      });
    }
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({
      message: `Succesfully deleted ${Delete.deletedCount} ${
        Delete.deletedCount > 1 ? "suppliers." : "supplier."
      }`,
    });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession()
       try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "supplier",
        details: { id:ids[0] },
        error: `failed to delete supplier ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res.status(500).json({ message: "Failed to delete supplier" });
  }
}
export { FetchSuppliers, AddSuppliers, DeleteSuppliers };
