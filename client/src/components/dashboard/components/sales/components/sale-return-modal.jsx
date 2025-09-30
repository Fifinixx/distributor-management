import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import { IoIosReturnLeft } from "react-icons/io";

import { capitalize } from "../../../../../lib/utils";
import { toast } from "sonner";
import { Spinner } from "../../../../ui/shadcn-io/spinner";
import { useAppContext } from "../../../../../app-context";

export default function ReturnDialog({ order, fetchOrders }) {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  const {_id} = useAppContext()
  const [returns, setReturns] = useState({
    _id: order._id,
    products: order.products.map((item) => {
      return {
        product_id: item.product_id._id,
        qty: 0,
        price: item.price.$numberDecimal,
      };
    }),
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  function setReturnQty(id, qty) {
    setReturns((prev) => {
      return {
        ...prev,
        products: prev.products.map((item) => {
          if (item.product_id === id) {
            return { ...item, qty: qty };
          } else {
            return { ...item };
          }
        }),
      };
    });
  }
  async function processReturn() {
    console.log(returns);
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/dashboard/sales/return`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({...returns, user:_id}),
      });
      if (res.ok) {
        setLoading(false);
        toast.success("Return modification succesful");
      } else {
        setLoading(false);
        toast.error("Return update failed!");
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      toast.error("Return update failed. Please try again!");
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" onClick={() => setOpen(true)} variant="outline">
          <IoIosReturnLeft />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Return</DialogTitle>
          <DialogDescription>
            Choose product and quantity to make a return
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableCaption>List of produts.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                Product
              </TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Return qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order?.products?.map((item) => {
              return (
                <TableRow key={item._id}>
                  <TableCell className="text-left whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                    {capitalize(item.product_id.name)}
                  </TableCell>
                  <TableCell className="font-medium">{item.qty}</TableCell>
                  <TableCell className="text-right float-right">
                    <Input
                      type="number"
                      onChange={(e) =>
                        setReturnQty(item.product_id._id, e.target.value)
                      }
                      className="w-20"
                      placeholder="Qty"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={loading} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={async () => {
              await processReturn();
              setOpen(false);
              fetchOrders();
            }}
            disabled={loading}
            type="submit"
          >
            {loading ? <Spinner /> : "Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
