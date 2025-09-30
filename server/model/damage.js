import mongoose from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const damageSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

damageSchema.plugin(mongoosePaginate)

export const DamageModel = mongoose.model("Damage", damageSchema);
