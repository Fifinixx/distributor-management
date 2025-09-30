import mongoose from "mongoose";
import { ShopsModel } from "../model/shops.js";
import { SalesModel } from "../model/sales.js";
import { LogModel } from "../model/logs.js";

async function FetchShops(req, res, next) {
  const { search, page, limit, paginate } = req.query;
  try {
    let query = {};
    if (search) {
      query = { ...query, name: { $regex: search, $options: "i" } };
    }
    if (paginate === "true") {
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        paginate: paginate,
      };
      const result = await ShopsModel.paginate(query, options);
      return res.json({
        shops: result.docs,
        totalPages: result.totalPages,
        currentPage: result.page,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } else {
      const result = await ShopsModel.find();
      return res.json({ shops: result });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Failed to fetch shops" });
  }
}

async function AddShops(req, res, next) {
  function validateAndNormalizeContact(contact) {
    if (!contact) {
      return { valid: false, normalized: null };
    }
    let cleaned = contact.replace(/\D/g, "");

    if (cleaned.startsWith("91") && cleaned.length === 12) {
      cleaned = cleaned.slice(2);
    }
    if (cleaned.startsWith("91") && cleaned.length !== 10) {
      return { valid: false, normalized: null };
    }
    const isValid = /^[6-9]\d{9}$/.test(cleaned);
    if (!isValid) {
      return { valid: false, normalized: null };
    }
    const normalized = `+91${cleaned}`;
    return { valid: true, normalized };
  }
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    const { name, contact, address } = req.body.input;
    const { user } = req.body;
    console.log(user);
    if (
      !name ||
      !validateAndNormalizeContact(contact).valid ||
      !address ||
      !user ||
      address.length < 5
    ) {
      return res.status(400).json({ message: "Invalid inputs provided" });
    }
    const normalizePhone = validateAndNormalizeContact(contact).normalized;
    const Shop = new ShopsModel({ name, contact: normalizePhone, address });
    await Shop.save({ session });
    const log = new LogModel({
      user: user,
      action: "CREATE_SHOP",
      entity: "shop",
      details: { name: name },
    });
    await log.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({ message: "Succesfully added a Shop" });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "shop",
        details: { name: name },
        error: `failed to add shop ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    if (e.name === "ValidationError") {
      return res.status(400).json({ message: e.message });
    }
    if (e.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate shop, please check product name" });
    }
    if (e.name === "CastError") {
      return res.status(400).json({ message: `Invalid ${e.path}: ${e.value}` });
    }
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
}

async function DeleteShops(req, res, next) {
  const { ids, user } = req.body;
  for (let id of ids) {
    if (id === null || !id || id === undefined) {
      return res.status(400).json({ message: "Invalid shop ID(s) provided" });
    }
  }
  if (!user) {
    return res.status(400).json({ message: "Invalid user" });
  }
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const shopIds = (await SalesModel.find({ shop_id: { $in: ids } }).session(session))
      .map((item) => item.shop_id.toString());

    const deletableIds = ids.filter((id) => !shopIds.includes(id));

    const Delete = await ShopsModel.deleteMany({
      _id: { $in: deletableIds },
      due: { $eq: 0 },
    }).session(session);

    const log = new LogModel({
      user: user,
      action: "DELETE_SHOP",
      entity: "shop",
      details: { id: ids[0] },
    });
    await log.save({ session });

    if (Delete.deletedCount !== ids.length) {
      return res.status(200).json({
        message: `Succesfully deleted ${Delete.deletedCount} ${
          Delete.deletedCount > 1 ? "suppliers." : "supplier."
        } Some Shops could not be deleted. Please remove any sales entries and try again.`,
      });
    }
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({
      message: `Succesfully deleted ${Delete.deletedCount} ${
        Delete.deletedCount > 1 ? "shops." : "shop."
      }`,
    });
  } catch (e) {
    await session.abortTransaction();
    await session.endSession()
    try {
      const log = new LogModel({
        user: user,
        action: "SYSTEM_ERROR",
        entity: "shop",
        details: { id: ids[0] },
        error: `failed to delete shop ${e.name || e.code}`,
      });
      await log.save();
    } catch (e) {
      console.log("Failed to save error log", e);
    }
    console.log(e);
    return res.status(500).json({ message: "Failed to delete shop" });
  }
}
export { FetchShops, AddShops, DeleteShops };
