import { LogModel } from "../model/logs.js";
async function FetchLogs(req, res, next) {
    const {page = 1, limit = 10} = req.query;
    const {role } = req.user;
    if(role !== "admin"){
      return res.status(401).json({message:"Unauthorized"});
    }
    let query={};
  try {
    const options = {
      page: parseInt(page, 10),
      limit:parseInt(limit, 10),
      populate: [{ path: "user", select: "name" }, "entityId"],
      sort: { createdAt: -1 },
    };
    const result = await LogModel.paginate(query, options);
    return res.json({
      logs: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      totalDocs: result.totalDocs,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Failed to fetch logs" });
  }
}

export {FetchLogs};
