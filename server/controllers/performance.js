import { OrdersModel } from "../model/orders.js";
import { SalesModel } from "../model/sales.js";

async function FetchPerformance(req, res, next) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  try {
      const purchases = await OrdersModel.aggregate([
        { $match: { createdAt: { $gte: oneYearAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalPurchases: { $sum: "$grandTotal" },
            totalDamageDiscount : {$sum: "$discountAmount"}
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
    
    const sales = await SalesModel.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalSales: { $sum: "$grandTotal" }
        }
      },
      { $sort: { "_id": 1, "_id": 1 } }
    ]);
    return res.json({purchases, sales })

  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ message: "Failed to load performace stats." });
  }
}

export { FetchPerformance };
