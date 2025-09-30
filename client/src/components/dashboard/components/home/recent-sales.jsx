import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { SalesOrderList } from "../../services/sales-orders";
import { formatCurrency, capitalize } from "../../../../lib/utils";

export function RecentSales() {
  const [loading, setLoading] = useState(true);
  const [saleOrders, setSaleOrders] = useState([]);
  async function fetchSaleOrders() {
    try {
      const res = await SalesOrderList(1, "", {
        shop_id: "",
        dateSort: -1,
        startDate: undefined,
        endDate: undefined,
        paid: false,
        unPaid: false,
      });
      if (res.ok) {
        const data = await res.json();
        setSaleOrders(data.orders);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to fetch Sales orders");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSaleOrders();
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
            <CardTitle>RECENT SALES</CardTitle>
            <CardDescription>Recent sales made</CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent>
            {saleOrders.length === 0 ? (
              <p>No sale orders found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Shop Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {capitalize(order.shop_id.name)}
                      </TableCell>
                      <TableCell>
                        {order.due.$numberDecimal > 0 ? "Pending" : "Paid"}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.due.$numberDecimal}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="text-center">
            <Link to="/dashboard/sales/history" className="w-full ">
              <Button className="w-full cursor-pointer">VIEW ALL SALES</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
