import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

import PaginationComponent from "./components/history-pagination";
import OrderDetailModal from "./components/order-detail-modal";
import HistoryFilters from "./components/purchase-history-filters";
import DeleteConfirmModal from "../delete-confirm-modal";
import { ReturnDialog } from "./components/purchase-return-modal";

import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Checkbox } from "@/components/ui/checkbox";

import { formatCurrency, formatDate, capitalize } from "../../../../lib/utils";

import { IoIosCheckmarkCircle } from "react-icons/io";

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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderList } from "../../services/orders";
import { Button } from "../../../ui/button";
import { Trash2 } from "lucide-react";
import { useAppContext } from "../../../../app-context";

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

export default function TableResponsive() {
  const {_id} = useAppContext();
  const [searchParams] = useSearchParams();
  const [orders, seOrders] = useState();
  const [openModals, setOpenModals] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [filterBySupplier, setFilterBySupplier] = useState({
    id: searchParams.get("filterBySupplierId") || "",
    name: searchParams.get("filterBySupplierName"),
  });
  const [dateSort, setDateSort] = useState(-1);
  const [dateFilter, setDateFilter] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [paidFilter, setPaidFilter] = useState(false);
  const [unPaidFilter, setUnpaidFilter] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  async function fetchOrders() {
    setLoadingTable(true);
    try {
      const res = await OrderList(
        page,
        search,
        filterBySupplier,
        dateSort,
        dateFilter,
        paidFilter,
        unPaidFilter
      );
      if (res.ok) {
        const data = await res.json();
        setLoadingPage(false);
        seOrders(data);
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
      console.log(e);
      toast.error("Error while fetching orders");
    }
  }

  async function deleteOrders(ids) {
    if (ids.length === 0) {
      toast.error("No orders selected");
    } else {
      try {
        const res = await fetch(`${baseUrl}/dashboard/orders`, {
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
          toast.error("Failed to delete purchase order");
        }
      } catch (e) {
        toast.error("Error while deleting");
        console.log(e);
      }
    }
  }

  async function setFilters() {
    fetchOrders();
  }

  function resetFilters() {
    setFilterBySupplier({ id: "", name: "" });
    setDateSort(-1);
    setDateFilter({ startDate: undefined, endDate: undefined });
    setPaidFilter(false);
    setUnpaidFilter(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [page, dateSort]);

  if (loadingPage) {
    return <Spinner />;
  } else {
    return (
      <div className="container w-full flex flex-col gap-6 justify-center items-center">
        <h1 className="text-xl ">
          LIST OF PURCHASE ORDERS
        </h1>
        <div className="flex flex-col w-full justify-center gap-1 items-center lg:flex-row">
          <HistoryFilters
            dateSort={dateSort}
            setDateSort={setDateSort}
            suppliers={suppliers}
            setPage={setPage}
            setSuppliers={setSuppliers}
            filterBySupplier={filterBySupplier}
            setFilterBySupplier={setFilterBySupplier}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            setFilters={setFilters}
            resetFilters={resetFilters}
            paidFilter={paidFilter}
            unPaidFilter={unPaidFilter}
            setUnpaidFilter={setUnpaidFilter}
            setPaidFilter={setPaidFilter}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full lg:w-auto">
                Sort By Date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={dateSort}
                onValueChange={setDateSort}
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
            icon="DELETE SELECTED"
            text="This action cannot be undone. This will permanently delete your
            entries and the stock/price will be adjusted."
            ids={selectedOrders}
            deleteOrders={deleteOrders}
          />
        </div>

        <div className="w-full p-2 border-[0.1px] rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">
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
                <TableHead className="text-center whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">Supplier</TableHead>
                <TableHead className="text-center ">Date</TableHead>
                <TableHead className="text-center">Payment Due</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            {loadingTable ? (
              <TableBody>
                <TableRow className="text-center">
                  <TableCell className="text-center" colSpan={7}>
                    <div className="flex justify-center items-center">
                      <Spinner />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : orders?.orders?.length === 0 ? (
              <TableBody>
                <TableRow className="text-center">
                  <TableCell colSpan={7}>No orders found</TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {orders.orders.map((order) => (
                  <TableRow className="text-center" key={order.id}>
                    <TableCell className="text-center">
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
                    <TableCell>{capitalize(order.supplier_id.name)}</TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      {order.due.$numberDecimal > 0 ? (
                        <span className="text-red-800">
                          {formatCurrency(order.due.$numberDecimal)}
                        </span>
                      ) : (
                        <span className="flex justify-center items-center gap-1">
                          <IoIosCheckmarkCircle className="text-lg text-green-700" />
                          NO DUES
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.grandTotal.$numberDecimal)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center space-x-1">
                        <OrderDetailModal
                          fetchOrders={fetchOrders}
                          order={order}
                          openModal={
                            openModals.find((item) => item.id === order._id)
                              ?.open
                          }
                          setOpenModals={setOpenModals}
                        />
                        <DeleteConfirmModal
                          variant="single"
                          icon={<Trash2 />}
                          text="This action cannot be undone. This will permanently delete your
            entries and the stock/price will be adjusted."
                          deleteOrders={deleteOrders}
                          ids={[order._id]}
                        />
                        <ReturnDialog fetchOrders={fetchOrders} order={order}/>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
        <PaginationComponent
          totalPages={orders.totalPages}
          page={page}
          setPage={setPage}
        />
      </div>
    );
  }
}
