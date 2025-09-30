import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Link } from "react-router";

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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { capitalize, formatCurrency } from "../../../../lib/utils";
import { OrderList } from "../../services/orders";

export function RecentPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      const res = await OrderList(
        1,
        "",
        { id: "", name: "" },
        -1,
        { startDate: undefined, endDate: undefined },
        false,
        false
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Error while fetching purchase orders");
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchOrders();
  }, []);
  return (
    <>
      {loading ? (
        <div className="space-y-6 h-full w-full">
          <Skeleton className="h-28 " />
          <Skeleton className="h-8 " />
          <Skeleton className="h-8 " />
          <Skeleton className="h-8 " />
          <Skeleton className="h-8 " />
          <Skeleton className="h-8 " />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>RECENT PURCHASES</CardTitle>
            <CardDescription>Recent purchases made</CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent>
            {orders.length == 0 ? (
              <p className="text-center">No Orders found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {capitalize(order.supplier_id.name)}
                      </TableCell>
                      <TableCell>
                        {order.due.$numberDecimal > 0 ? "Pending" : "Paid"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.grandTotal.$numberDecimal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="text-center">
          <Link to="/dashboard/purchase/history" className="w-full ">
              <Button className="w-full cursor-pointer">
                VIEW ALL PURCHASES
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
