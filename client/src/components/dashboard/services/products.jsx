export async function ProductList(
  page = 1,
  search = "",
  filterBySupplier = { id: "", name: "" },
  paginate = true,
  stockFilter = { inStock: false, outOfStock: false },
  stockLowerRange,
  stockUpperRange
) {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  try {
    const res = await fetch(
      `${baseUrl}/dashboard/inventory?page=${page}&limit=10&search=${search}&supplierId=${filterBySupplier.id}&paginate=${paginate}&inStock=${stockFilter.inStock}&outOfStock=${stockFilter.outOfStock}&stockLowerRange=${stockLowerRange}&stockUpperRange=${stockUpperRange}`,
      {
        credentials: "include",
      }
    );
    return res;
  } catch (e) {
    throw new Error(e);
  }
}
