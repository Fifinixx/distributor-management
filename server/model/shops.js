import mongoose from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const shopSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pendingOrders: { type: Number, default: 0 },
  due: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
});

shopSchema.plugin(mongoosePaginate);

export const ShopsModel = mongoose.model("Shop", shopSchema);
