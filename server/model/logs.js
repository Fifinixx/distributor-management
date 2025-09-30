import mongoose from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const logSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to your User model
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE_SUPPLIER",
        "DELETE_SUPPLIER",
        "CREATE_SHOP",
        "DELETE_SHOP",
        "CREATE_PRODUCT",
        "DELETE_PRODUCT",
        "CREATE_PURCHASE_ORDER",
        "MAKE_PURCHASE_PAYMENT",
        "DELETE_PURCHASE_ORDER",
        "RETURN_PURCHASE_ORDER",
        "CREATE_SALE_ORDER",
        "MAKE_SALE_PAYMENT",
        "DELETE_SALE_ORDER",
        "RETURN_SALE_ORDER",
        "RECORD_DAMAGE",
        "DELETE_DAMAGE",
        "LOGIN_FAILED",
        "LOGIN_SUCCESS",
        "SYSTEM_ERROR",
      ],
    },
    entity: {
      type: String, // supplier, shop, product, purchaseOrder, saleOrder, etc.
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId, // ID of supplier/shop/product/order
      required: false,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // flexible object to store extra data
      default: {},
    },
    error: {
      type: String, // optional error message (for failed operations)
    },
  },
  { timestamps: true }
);

logSchema.plugin(mongoosePaginate)

export const LogModel = mongoose.model("Log", logSchema);
