import mongoose from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const salesItemsSchema = new Schema({
  supplier_id: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: [1, "Quantity must be atlest 1"],
  },
  purchasePrice: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  gst: {
    type: Number,
  },
  gstAmount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  salePrice: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  profitAndLoss: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  total: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
});

const salesSchema = new Schema(
  {
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    id: {
      type: String,
      unique: true,
    },
    landedCost:{
      type:mongoose.Schema.Types.Decimal128,
      default:0.0
    },
    grandTotal: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
    },
    payment: { type: mongoose.Schema.Types.Decimal128, default: 0.0 },
    due: { type: mongoose.Schema.Types.Decimal128, default: 0.0 },
    products: [salesItemsSchema],
  },
  { timestamps: true }
);

salesSchema.plugin(mongoosePaginate);

salesSchema.pre("save", async function (next) {
  const prefix = "SALE";
  let existingId = true;
  let newId;
  while (existingId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    newId = prefix + rand;
    existingId = await this.constructor.exists({ id: newId });
  }
  this.id = newId;
  let total = 0;
  for (let product of this.products) {
    const productDoc = await mongoose
      .model("Product")
      .findById(product.product_id);
    if (!productDoc) {
      return next(new Error("Invalid product ref"));
    }
    let discountAmount = 0;
    product.purchasePrice =
      Number((productDoc.avgPrice - productDoc.avgPrice * (productDoc.gst / 100)).toFixed(2));
    product.gst = productDoc.gst;

    product.gstAmount = (
      Number(product.salePrice) * Number(productDoc.gst / 100)
    ).toFixed(2);
    product.salePrice = (
      Number(product.salePrice) - Number(product.gstAmount)
    ).toFixed(2);

    if (product.discount && product.discount > 0) {
      discountAmount = (
        (Number(product.salePrice) * Number(product.discount)) /
        100
      ).toFixed(2);
    }
    product.profitAndLoss = (
      Number(product.salePrice) -
      Number(discountAmount) -
      product.purchasePrice
    ).toFixed(2);
    product.price = (
      Number(product.salePrice) -
      Number(discountAmount) +
      Number(product.gstAmount)
    ).toFixed(2);
    
    product.discountAmount = discountAmount;
    product.total = (product.price * product.qty).toFixed(2);

    total += product.price * product.qty;
  }
  this.grandTotal = Number(total).toFixed(2);
  this.due = Number(total).toFixed(2);
  this.payment = 0;
  next();
});

export const SalesModel = mongoose.model("Sale", salesSchema);
