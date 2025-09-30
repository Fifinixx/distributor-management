export async function OrderList(
  page = 1,
  search = "",
  filterBySupplier = {id:"", name:""},
  dateSort = -1,
  dateFilter,
  paidFilter = false,
  unPaidFilter = false
) {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  try {
    const res = await fetch(
      `${baseUrl}/dashboard/orders?page=${page}&limit=10&search=${search}&supplierId=${filterBySupplier.id}&dateSort=${dateSort}&startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}&paidFilter=${paidFilter}&unPaidFilter=${unPaidFilter}`,
      {
        credentials: "include",
      }
    );
    return res;
  } catch (e) {
    throw new Error(e);
  }
}
