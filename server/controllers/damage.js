import mongoose from "mongoose";

import { DamageModel } from "../model/damage.js";
import { ProductModel } from "../model/product.js";

export async function RecordDamage(req, res, next) {
  const { _id, qty } = req.body;
  if (!_id || !Number(qty)) {
    return res.status(400).json({ message: "Invalid inputs" });
  }
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    const ProductDoc = await ProductModel.findById(_id);
    if(ProductDoc.stock < qty){
        return res.status(400).json({message:"Not enough stock available"})
    }
     await ProductModel.findByIdAndUpdate(_id, {
      $inc: { stock: -qty },
    }).session(session);
    const damage = new DamageModel({product:_id, qty:qty});
    await damage.save({session:session});
    await session.commitTransaction();
    await session.endSession()
    return res.json({message:"Succesfully recorded damage products"});  
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    console.log(e);
    return res.status(400).json({ message: "Failed to record damage" });
  }
}
