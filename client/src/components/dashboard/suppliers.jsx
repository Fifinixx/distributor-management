import { useState, useEffect } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "../../lib/utils";
import { SupplierList } from "./services/suppliers";
import { AddSupplierDialog } from "./components/suppliers/add-supplier-dialog";
import Search from "./components/suppliers/search";
import SuppliersPagination from "./components/suppliers/suppliers-pagination";
import DeleteConfirmModal from "./components/delete-confirm-modal";

import { Trash2 } from "lucide-react";
import { useAppContext } from "../../app-context";

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
export default function Suppliers() {
  const [input, setInput] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [page, setPage] = useState(1);
  const {_id} = useAppContext();

  async function fetchSuppliers() {
    setLoading(true);
    try {
      const res = await SupplierList(page, search, true);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
        setLoading(false);
      }
    } catch (e) {
      toast.error("Failed to fetch suppliers");
      setLoading(false);
    }
  }

  async function AddSuppliers() {
    setLoadingAdd(true);
    try {
      const res = await fetch(`${baseUrl}/dashboard/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input, user:_id }),
        credentials: "include",
      });
      if (res.ok) {
        await fetchSuppliers();
        setLoadingAdd(false);
        toast.success(`Succesfully added ${input} as a supplier`);
      } else {
        toast.error("Something went wrong while adding the supplier!");
        setLoadingAdd(false);
      }
    } catch (e) {
      toast.error("Failed to add supplier!");
      setLoadingAdd(false);
    }
  }

  async function DeleteSupppliers(ids) {
    try {
      const res = await fetch(`${baseUrl}/dashboard/suppliers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, user:_id }),
        credentials: "include",
      });
      if (res.ok) {
        const message = await res.json();
        toast.success(message.message);
        fetchSuppliers();
      } else {
        toast.error("Failed to delete supplier");
      }
    } catch (e) {
      console.log(e);
      toast.error("Server Error: Failed to delete supplier!");
    }
  }

  useEffect(() => {
    fetchSuppliers();
  }, [page, search]);
  return (
    <div className="container w-full flex flex-col gap-6">
      <h1 className="text-xl text-center ">SUPPLIERS</h1>
      <div className="flex justify-center items-center gap-2">
        <Search setSearch={setSearch} />
        <AddSupplierDialog
          loadingAdd={loadingAdd}
          setLoadingAdd={setLoadingAdd}
          input={input}
          setInput={setInput}
          AddSuppliers={AddSuppliers}
        />
      </div>
      {loading ? (
        <Spinner className="w-full" />
      ) : suppliers?.totalDocs === 0 ? (
        <h1 className="text-center">No Suppliers found</h1>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            {suppliers.suppliers.map((item) => {
              return (
                <Card key={item.name} className="w-full ">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                      </CardTitle>
                      <DeleteConfirmModal
                      variant="single"
                        deleteOrders={DeleteSupppliers}
                        text="Are you sure you want to delete this supplier?"
                        ids={[item._id]}
                        icon={<Trash2 />}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col justify-center items-start gap-2">
                      <h2>Total Proucts: {item.productCount}</h2>
                      <h2>Pending Orders: {item.pendingOrders}</h2>
                      <h2 className="text-red-800">
                        Supplier dues: {formatCurrency(Number(item.due.$numberDecimal).toFixed(2))}
                      </h2>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button type="button" className="w-full cursor-pointer">
                      <Link
                        to={`/dashboard/purchase/history?filterBySupplierId=${
                          item._id
                        }&filterBySupplierName=${
                          item.name.charAt(0).toUpperCase() + item.name.slice(1)
                        }`}
                      >
                        ORDER HISTORY
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full cursor-pointer"
                    >
                      <Link
                        to={`/dashboard/inventory?filterBySupplierId=${
                          item._id
                        }&filterBySupplierName=${
                          item.name.charAt(0).toUpperCase() + item.name.slice(1)
                        }`}
                      >
                        VIEW PRODUCTS
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          <SuppliersPagination
            page={page}
            setPage={setPage}
            totalPages={suppliers.totalPages}
          />
        </div>
      )}
    </div>
  );
}
