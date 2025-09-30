import { ProductModel } from "../model/product.js";
async function Inventory(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      supplierId,
      paginate,
      inStock,
      outOfStock,
      stockLowerRange,
      stockUpperRange,
    } = req.query;
    if (paginate === "true") {
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: "supplier",
        sort: { supplier: 1 },
      };
      let query;
      if (supplierId || search) {
        if (supplierId) {
          query = supplierId ? { supplier: supplierId } : {};
        }
        if (search) {
          let cleanedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          query = { ...query, name: { $regex: cleanedSearch, $options: "i" } };
        }
      }

      if (!(inStock === "true" && outOfStock === "true")) {
        if (inStock === "true") {
          query = { ...query, stock: { $gt: 0 } };
        }
        if (outOfStock === "true") {
          query = { ...query, stock: 0 };
        }
      }
      if (
        Number(stockLowerRange) &&
        stockLowerRange >= 0 &&
        Number(stockUpperRange) &&
        stockUpperRange > 0
      ) {
        query = {
          ...query,
          stock: { $and: { $gte: stockLowerRange, $lte: stockUpperRange } },
        };
      }

      const result = await ProductModel.paginate(query, options);
      return res.json({
        products: result.docs,
        totalPages: result.totalPages,
        currentPage: result.page,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } else {
      let query = {};
      if (
        Number(stockLowerRange) >= 0 &&
        Number(stockUpperRange)  > 0
      ) {
        query = {
          ...query,
          stock: { $gte: Number(stockLowerRange), $lte: Number(stockUpperRange) },
        };
        
      }
      if(Object.keys(query).length !== 0){
        const result = await ProductModel.find({ stock: query.stock });
        return res.json({ products: result });
      }else{
        const result = await ProductModel.find();
        return res.json({ products: result });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
}

export { Inventory };
