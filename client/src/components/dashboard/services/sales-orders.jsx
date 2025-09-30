export async function SalesOrderList(
    page = 1,
    search = "",
    inputs,
    paginate=true
  ) {
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
    try {
      const res = await fetch(
        `${baseUrl}/dashboard/sales?page=${page}&limit=10&search=${search}&shop_id=${inputs.shop_id}&dateSort=${inputs.dateSort}&startDate=${inputs.startDate}&endDate=${inputs.endDate}&paidFilter=${inputs.paid}&unPaidFilter=${inputs.unPaid}&paginate=${paginate}`,
        {
          credentials: "include",
        }
      );
      return res;
    } catch (e) {
      throw new Error(e);
    }
  }
  