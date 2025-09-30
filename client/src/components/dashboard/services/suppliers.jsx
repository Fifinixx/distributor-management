export async function SupplierList(page=1, search="", paginate=false){
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
    try {
        const res = await fetch(`${baseUrl}/dashboard/suppliers?page=${page}&limit=10&search=${search}&paginate=${paginate}`, {
          credentials: "include",
        });
        return res;
      } catch (e) {
        throw new Error(e);
      }
  }