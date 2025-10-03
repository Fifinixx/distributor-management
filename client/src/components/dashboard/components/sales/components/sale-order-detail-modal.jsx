import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, trimName } from "../../../../../lib/utils";
import { FaEye } from "react-icons/fa";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { capitalize } from "../../../../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

export default function SaleOrderDetailModal({
  order,
  openModal,
  setOpenModals,
  fetchOrders,
}) {
  const [loadingPay, setLoadingPay] = useState(false);
  const [amount, setAmount] = useState("");

  async function makePayment(id, due) {
      setLoadingPay(true);
      try {
        const res = await fetch(`${baseUrl}/dashboard/sales/`, {
          method: "PUT",
          body: JSON.stringify({ id: id, amount: amount }),
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
  return (
    <>
      <Button
        className="cursor-pointer"
        type="button"
        onClick={() =>
          setOpenModals((prev) => {
            return prev.map((item) => {
              return item.id === order._id
                ? { id: order._id, open: true }
                : item;
            });
          })
        }
        variant="outline"
      >
        <FaEye />
      </Button>
      <Dialog
        className="w-full sm:w-auto"
        open={openModal}
        onOpenChange={(isOpen) => {
          setOpenModals((prev) =>
            prev.map((item) =>
              item.id === order._id ? { ...item, open: isOpen } : item
            )
          );
        }}
      >
        <DialogContent className="pl-0 text-xl  pr-0 overflow-auto  sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex w-full gap-2">
              <div className=" w-full flex flex-col justify-center items-center gap-4 sm:flex-row sm:items-center sm:justify-start">
              <span className="text-neutral-400"> ORDER ID: {order.id}</span>
              <span className="text-neutral-400">
                {order.shop_id.name.toUpperCase()}
              </span>
              </div>
            </DialogTitle>
            <DialogDescription>
              View order details or make partial/full payment
            </DialogDescription>
          </DialogHeader>
          <ScrollArea>
            <Table>
              <TableCaption>A list of products in your order.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left ">NAME</TableHead>
                  <TableHead className="text-center">BUY</TableHead>
                  <TableHead className="text-center">SALE</TableHead>
                  <TableHead className="text-center">DISC</TableHead>
                  <TableHead className="text-center">P/L</TableHead>
                  <TableHead className="text-center">GST</TableHead>
                  <TableHead className="text-center">PRICE</TableHead>
                  <TableHead className="text-center">QTY</TableHead>
                  <TableHead className="text-right">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px]">
                      {capitalize(product.product_id.name)}
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px]">
                      {formatCurrency(product.purchasePrice.$numberDecimal)}
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px]">
                      {formatCurrency(product.salePrice.$numberDecimal)}
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px]">
                      {formatCurrency(product.discountAmount.$numberDecimal)} ({product.discount}%)
                    </TableCell>
                    <TableCell className={`text-center font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px] ${product.profitAndLoss.$numberDecimal >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {formatCurrency(product.profitAndLoss.$numberDecimal)}
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px]">
                      {formatCurrency(product.gstAmount.$numberDecimal)}
                      {` (${product.gst}%)`}
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px]">
                      {formatCurrency(product.price.$numberDecimal)}
                    </TableCell>
                    <TableCell className="text-center">{product.qty}</TableCell>
                    <TableCell className="text-right font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px]">
                      {formatCurrency(product.total.$numberDecimal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={9} className="text-right font-medium whitespace-normal break-words max-w-[50px] sm:max-w-[250px] ">
                    Total: {formatCurrency(order.grandTotal.$numberDecimal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </ScrollArea>
          <DialogFooter className="flex gap-4 flex-col sm:flex-row items-center justify-center">
            <h2 className="text-md w-full flex justify-center items-center gap-1 text-center sm:w-1/3">
              <span>Due: </span>
              <span className={`${Number(order.$numberDecimal) < 0 ? "text-red-800" : "text-green-800 "}text-lg`}>
                {formatCurrency(Number(order.due.$numberDecimal))}
              </span>
            </h2>
            <h2 className="text-md flex justify-center items-center gap-1 w-full text-center sm:w-1/3">
              <span>Payment received: </span>
              <span className="text-green-700 text-lg">
                {formatCurrency(
                 Number(order.payment.$numberDecimal.toString())
                )}
              </span>
            </h2>

              <div className="flex justify-center items-center w-full sm:w-1/3">
                <Input
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-[0px]"
                />
                <Button
                  disabled={loadingPay}
                  type="button"
                  onClick={() => makePayment(order._id, order.due)}
                  className="rounded-[0px]"
                >
                  {loadingPay ? <Spinner /> : "PAY"}
                </Button>
              </div>

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
