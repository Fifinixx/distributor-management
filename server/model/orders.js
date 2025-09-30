import mongoose from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const ordersItemsSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min:[1, "Quantity must be atlest 1"]
  },
  price: {
    type: mongoose.Schema.Types.Decimal128, default: 0.0,
    min:[0.0, "Price cannot be negative"]
  },
  basePrice: {
    type: mongoose.Schema.Types.Decimal128, default: 0.0,
  },
  gstPercent:{
    type:Number
  },
  gstAmount:{
    type: mongoose.Schema.Types.Decimal128, default: 0.0
  },
  total:{
    type: mongoose.Schema.Types.Decimal128, default: 0.0
  }
})

const ordersSchema = new Schema(
  {
    supplier_id: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    id: {
      type: String,
      unique: true,
    },
    grandTotal:{
      type: mongoose.Schema.Types.Decimal128, default: 0.0
    },
    due:{
      type: mongoose.Schema.Types.Decimal128, default: 0.0
    },
    payment:{
      type: mongoose.Schema.Types.Decimal128, default: 0.0
    },
    discount:{
      type: Number, 
      default: 0
    },
    discountAmount:{
      type: mongoose.Schema.Types.Decimal128, default: 0.0
    },
    products:[ordersItemsSchema]
  },
  { timestamps: true }
);


ordersSchema.plugin(mongoosePaginate)

ordersSchema.pre("save", async function (next) {
  const prefix = "ORD";
  let existingId = true;
  let newId;
  while (existingId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    newId = prefix + rand;
    existingId = await OrdersModel.exists({ id: newId });
  }
  this.id = newId;
  let total = 0
  for(let product of this.products){
      const productDoc = await mongoose.model("Product").findById(product.product_id);
      if(!productDoc){
        return next (new Error("Invalid product ref"));
      }
      product.gstPercent = productDoc.gst;
      product.gstAmount =( product.price * (productDoc.gst/100)).toFixed(2);
      product.basePrice = (product.price - (product.price * (productDoc.gst/100))).toFixed(2);
      total += product.price * product.qty
  }
  this.grandTotal = Number(total).toFixed(2);
  this.due = Number(total).toFixed(2);
  this.payment = 0;
  if(Number(this.discount)){
    console.log("Custom error set by me")
    this.discount = Number(this.discount);
    this.discountAmount = Number(((Number(this.discount) /100) * Number(total)).toFixed(2));
  }else{
    console.log("error")
    this.discount = mongoose.Types.Decimal128.fromString("0.00");
    this.discountAmount = mongoose.Types.Decimal128.fromString("0.00");
  }
  next();
});

export const OrdersModel = mongoose.model("Order", ordersSchema);
