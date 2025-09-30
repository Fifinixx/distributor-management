import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, trimName } from "../../../../../lib/utils";
import { FaEye } from "react-icons/fa";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
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
import { useAppContext } from "../../../../../app-context";

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

export default function OrderDetailModal({
  order,
  openModal,
  setOpenModals,
  fetchOrders,
}) {
  const {_id} = useAppContext();
  const [loadingPay, setLoadingPay] = useState(false);
  const [amount, setAmount] = useState("");

  async function makePayment(id, due) {
    if (amount > due) {
      toast.error("Cannot overpay. Please check amount");
    } else {
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
          const data = await res.json()
          console.log(data.message)
          toast.error(data.message);
        }
      } catch (e) {
        console.log(e);
        toast.error("Failed to set paid amount!");
        setLoadingPay(false);
      }
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
        className="container"
        open={openModal}
        onOpenChange={(isOpen) => {
          setOpenModals((prev) =>
            prev.map((item) =>
              item.id === order._id ? { ...item, open: isOpen } : item
            )
          );
        }}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              ORDER DETAILS: <span className="text-blue-600">{order.id}</span>
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
                  <TableHead className="w-[100px]">NAME</TableHead>
                  <TableHead className="text-center">BASE PRICE</TableHead>
                  <TableHead className="text-center">GST</TableHead>
                  <TableHead className="text-center">PRICE</TableHead>
                  <TableHead className="text-center">QTY</TableHead>
                  <TableHead className="text-right">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                      {product.product_id.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.basePrice.$numberDecimal}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(product.gstAmount.$numberDecimal)}
                      {` (${product.gstPercent}%)`}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(Number(product.price.$numberDecimal).toFixed(2))}
                    </TableCell>
                    <TableCell className="text-center">{product.qty}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        (Number(product.basePrice.$numberDecimal) + Number(product.gstAmount.$numberDecimal)) * product.qty
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}></TableCell>
                  <TableCell className="text-right">
                    Total: {formatCurrency(order.grandTotal.$numberDecimal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </ScrollArea>
          <DialogFooter className="flex gap-4 flex-col sm:flex-row items-center justify-center">
            <h2 className="text-md w-full flex justify-center items-center gap-1 text-center sm:w-1/3">
              <span>Due: </span>
              <span className="text-red-800 text-lg">
                {formatCurrency(order.due.$numberDecimal)}
              </span>
            </h2>
            <h2 className="text-md flex justify-center items-center gap-1 w-full text-center sm:w-1/3">
              <span>Payment made: </span>
              <span className="text-green-700 text-lg">
                {formatCurrency(order.payment.$numberDecimal)}
              </span>
            </h2>
            {Number(order.due.$numberDecimal) !== 0 ? (
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
            ) : (
              <div className="w-1/3">
                <p className="w-full text-green-700">
                  Bill has been paid in full.
                </p>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
