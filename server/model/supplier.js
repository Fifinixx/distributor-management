import mongoose from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const supplierSchema = new Schema({
  name:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true
  },
  productCount:{
    type:Number,
    default:0
  },
  pendingOrders:{
    type:Number,
    default:0
  },
  due:{
    type: mongoose.Schema.Types.Decimal128,
    default:0
  }
});

supplierSchema.plugin(mongoosePaginate)


export const SupplierModel = mongoose.model("Supplier", supplierSchema);
