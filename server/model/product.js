import mongoose, { Schema } from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase:true
  },
  mrp:{
    type: mongoose.Schema.Types.Decimal128, default: 0.0,
    required:true,
    min:[0.0, "MRP cannot be negative"]
  },
  avgPrice: {
    type: mongoose.Schema.Types.Decimal128, default: 0.0,
    set: (v) => Math.round(v * 100) / 100,
  },
  totalCost: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  stock: {
    type: Number,
    required: true,
    min: [0, "Stock cannot be negative"],
  },
  gst: {
    type: Number,
    required: true,
    min: [0, "GST cannot be negative"],
  },
}, {timestamps:true});

productSchema.index({ supplier: 1, name: 1 }, { unique: true }); // compounding index

productSchema.plugin(mongoosePaginate);

productSchema.pre("save", async function (next) {
  if (this.isNew) {
    await this.populate("supplier");
    const prefix = this.supplier.name.slice(0, 2).toUpperCase();
    let existingId = true;
    let newId;
    while (existingId) {
      const rand = Math.floor(100000 + Math.random() * 900000);
      newId = prefix + rand;
      existingId = await ProductModel.exists({ id: newId });
    }
    this.id = newId;
  }
  next();
});
export const ProductModel = mongoose.model("Product", productSchema);
