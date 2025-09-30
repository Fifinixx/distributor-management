import { useState, useEffect } from "react";

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
import { AddShopDialog } from "./components/shops/add-shop-dialog";
import ShopsPagination from "./components/shops/shops-pagination";
import Search from "./components/shops/search";
import { ShopList } from "./services/shops";
import DeleteConfirmModal from "./components/delete-confirm-modal";
import { Trash2 } from "lucide-react";
import { useAppContext } from "../../app-context";

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
export default function Suppliers() {
  const [input, setInput] = useState({ name: "", contact: "", address: "" });
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [page, setPage] = useState(1);
  const {_id} = useAppContext();
  async function fetchShops() {
    setLoading(true)
    try {
      const res = await ShopList(page, search, true);
      if (res.ok) {
        const data = await res.json();
        setShops(data);
        setLoading(false);
      }
    } catch (e) {
      toast.error("Failed to fetch shops");
      setLoading(false);
    }
  }

  async function deleteShops(ids){
    try{
      const res = await fetch(`${baseUrl}/dashboard/shops`, {
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ids, user:_id}),
        credentials:"include"
      })
      if(res.ok){
        const message = await res.json()
        toast.success(message.message)
        fetchShops();
      }else{
        toast.error("Failed to delete shop(s)")
      }
    }catch(e){
      console.log(e)
      toast.error("Server Error: Failed to delete shop(s)!")
    }
}
  async function addShops() {
    console.log(_id)
    setLoadingAdd(true);
      try {
        const res = await fetch(`${baseUrl}/dashboard/shops`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, user:_id }),
          credentials: "include",
        });
        if (res.ok) {
          await fetchShops();
          setLoadingAdd(false);
          toast.success(`Succesfully added ${input.name} as a shop`);
        } else {
          const data = await res.json()
          toast.error(data.message);
          setLoadingAdd(false);
        }
      } catch (e) {
        toast.error("Something went wrong while adding the shop");
        setLoadingAdd(false);
      }
  }

  useEffect(() => {
    fetchShops();
  }, [search, page]);

  return (
    <div className="container w-full flex flex-col gap-6">
      <h1 className="text-xl text-center ">SHOPS</h1>
      <div className="flex justify-center items-center gap-2">
        <Search setSearch={setSearch} />
        <AddShopDialog
          loadingAdd={loadingAdd}
          setLoadingAdd={setLoadingAdd}
          input={input}
          setInput={setInput}
          addShops={addShops}
        />
      </div>
      {loading ? (
        <Spinner className="w-full" />
      ) : shops?.totalDocs === 0 ? (
        <h1 className="text-center">No Shops found</h1>
      ) : (
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            {shops.shops.map((item) => {
              return (
                <Card key={item.name} className="w-full ">
                  <CardHeader>
                  <div className="flex justify-between items-center">
                      <CardTitle>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</CardTitle>
                      <DeleteConfirmModal
                      variant="single"
                        deleteOrders={deleteShops}
                        text="Are you sure you want to delete this shop?"
                        ids={[item._id]}
                        icon={<Trash2 />}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                  <div className="flex flex-col justify-center items-start gap-2">
                    <h2>Pending Orders: {item.pendingOrders}</h2>
                    <h2 className={`${item.due.$numberDecimal < 0 ? "text-red-700" : "text-green-700"}`}>
                      Shop dues: {formatCurrency(item.due.$numberDecimal)}
                    </h2>
                    <p className="text-neutral-400 text-sm">Address: {item.address}</p>
                    <p className="text-neutral-400 text-sm">Contact: {item.contact}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full">
                      ORDER HISTORY
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          <ShopsPagination
            page={page}
            setPage={setPage}
            totalPages={shops.totalPages}
          />
        </div>
      )}
    </div>
  );
}
