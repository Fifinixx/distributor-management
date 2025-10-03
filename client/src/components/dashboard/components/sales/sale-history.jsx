import { useState, useEffect } from "react";

import SaleHistoryPagination from "./components/sale-history-pagination";
import SaleOrderDetailModal from "./components/sale-order-detail-modal";
import SaleHistoryFilters from "./components/sale-history-filters";
import DeleteConfirmModal from "../../components/delete-confirm-modal";
import ReturnDialog from "./components/sale-return-modal";
import { InvoiceModal } from "./components/invoice-modal";

import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Checkbox } from "@/components/ui/checkbox";

import { formatCurrency, formatDate } from "../../../../lib/utils";

import { IoIosCheckmarkCircle, IoIosReturnLeft } from "react-icons/io";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SalesOrderList } from "../../services/sales-orders";
import { Button } from "../../../ui/button";
import { Trash2 } from "lucide-react";
import { useAppContext } from "../../../../app-context";

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

export default function SaleOrderHistory() {
  const {_id} = useAppContext();
  const [orders, setOrders] = useState();
  const [openModals, setOpenModals] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [amount, setAmount] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [shops, setShops] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [inputs, setInputs] = useState({
    shop_id: "",
    shopName: "",
    paid: false,
    unPaid: false,
    startDate: undefined,
    endDate: undefined,
    dateSort: -1,
  });

  async function makePayment(id) {
    setLoadingPay(true);
    try {
      const res = await fetch(`${baseUrl}/dashboard/orders/payment`, {
        method: "PUT",
        body: JSON.stringify({ id: id, amount: amount, user:_id }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.ok) {
        setLoadingPay(false);
        fetchOrders();
        toast.success("Payment adjusted");
      } else {
        setLoadingPay(false);
        toast.error("Payment updation failed!");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to set paid amount!");
      setLoadingPay(false);
    }
  }

  async function fetchOrders() {
    setLoadingTable(true);
    try {
      const res = await SalesOrderList(page, search, inputs);
      if (res.ok) {
        const data = await res.json();
        setLoadingPage(false);
        setOrders(data);
        resetInputs();
        setOpenModals(
          data.orders.map((item) => {
            return { id: item._id, open: false };
          })
        );
        setLoadingTable(false);
      } else {
        setLoadingPage(false);
        toast.error("Error while fetching orders");
        setLoadingTable(true);
      }
    } catch (e) {
      setLoadingPage(false);
      setLoadingTable(false);
      toast.error("Error while fetching orders");
    }
  }

  async function deleteOrders(ids) {
    if (ids.length === 0) {
      toast.error("No orders selected");
    } else {
      try {
        const res = await fetch(`${baseUrl}/dashboard/sales`, {
          method: "DELETE",
          body: JSON.stringify({ ids: ids, user:_id }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          toast.success(data.message);
          fetchOrders();
        } else {
          toast.error("Failed to delete sale order");
        }
      } catch (e) {
        toast.error("Error while deleting");
        console.log(e);
      }
    }
  }

  function resetInputs() {
    setInputs({
      shop_id: "",
      shopName: "",
      paid: false,
      unPaid: false,
      startDate: undefined,
      endDate: undefined,
      dateSort: -1,
    });
  }
  useEffect(() => {
    fetchOrders();
  }, [page, inputs.dateSort]);

  if (loadingPage) {
    return <Spinner />;
  } else {
    return (
      <div className="container w-full flex flex-col gap-6 justify-center items-center">
       <h1 className="text-xl">
          LIST OF SALE ORDERS
        </h1>
        <div className="w-full flex flex-col justify-center items-center gap-2 lg:flex-row">
          <SaleHistoryFilters
            fetchOrders={fetchOrders}
            shops={shops}
            setShops={setShops}
            setPage={setPage}
            inputs={inputs}
            setInputs={setInputs}
            resetInputs={resetInputs}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full lg:w-auto">
                Sort By Date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={inputs.dateSort}
                onValueChange={(value) =>
                  setInputs((prev) => {
                    return { ...prev, dateSort: value };
                  })
                }
              >
                <DropdownMenuRadioItem value={-1}>
                  NEWEST TO OLDEST
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={1}>
                  OLDEST TO NEWEST
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteConfirmModal
            variant="multiple"
            deleteOrders={deleteOrders}
            ids={selectedOrders}
            text="Are you absolutely sure you want to delete the selcted order(s)?"
            icon="DELETE SELECTED"
          />
        </div>
        <div className="w-full mx-auto p-2 border-[0.1px] rounded-md">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={
                        selectedOrders.length === orders.orders.length &&
                        orders.orders.length !== 0
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOrders(
                            orders.orders.map((item) => item._id)
                          );
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="text-center hidden sm:table-cell">
                    Order ID
                  </TableHead>
                  <TableHead className="text-center">Shop</TableHead>
                  <TableHead className="text-center ">Date</TableHead>
                  <TableHead className="text-center">Due</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Invoice</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              {loadingTable ? (
                <TableBody>
                  <TableRow className="text-center">
                    <TableCell className="text-center" colSpan={8}>
                      <div className="flex justify-center items-center">
                        <Spinner />
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : orders?.orders?.length === 0 ? (
                <TableBody>
                  <TableRow className="text-center">
                    <TableCell colSpan={8}>No orders found</TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {orders.orders.map((order) => (
                    <TableRow className="text-center" key={order.id}>
                      <TableCell className="text-left">
                        <Checkbox
                          checked={selectedOrders.includes(order._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedOrders((prev) => [...prev, order._id]);
                            } else {
                              setSelectedOrders((prev) =>
                                prev.filter((id) => id !== order._id)
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium hidden sm:table-cell">
                        {order.id}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                        {order.shop_id.name.charAt(0).toUpperCase() +
                          order.shop_id.name.slice(1)}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                      <span className={`${order.due.$numberDecimal > 0 ? "text-green-700" : "text-red-700"}`}>
                            {formatCurrency(Number(order.due.$numberDecimal))}
                          </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.grandTotal.$numberDecimal)}
                      </TableCell>
                      <TableCell>
                        <InvoiceModal order={order} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col justify-center items-center gap-1 sm:flex-row">
                          <SaleOrderDetailModal
                            fetchOrders={fetchOrders}
                            loadingPay={loadingPay}
                            setLoadingPay={setLoadingPay}
                            makePayment={makePayment}
                            amount={amount}
                            setAmount={setAmount}
                            order={order}
                            orders={orders}
                            openModal={
                              openModals.find((item) => item.id === order._id)
                                ?.open
                            }
                            setOpenModals={setOpenModals}
                          />
                          <DeleteConfirmModal
                            variant="single"
                            deleteOrders={deleteOrders}
                            ids={[order._id]}
                            text="Are you absolutely sure you want to delete the selcted order(s)?"
                            icon={<Trash2 />}
                          />
                          <ReturnDialog
                            fetchOrders={fetchOrders}
                            order={order}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </div>
        </div>
        <SaleHistoryPagination
          totalPages={orders.totalPages}
          page={page}
          setPage={setPage}
        />
      </div>
    );
  }
}
