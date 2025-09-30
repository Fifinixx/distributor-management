import { Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";

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
import { formatCurrency,capitalize } from "../../../../lib/utils";
export default function SalesOrderList({ orders, removeFromOrder }) {
  return (
    <>
      {orders.length === 0 ? (
        <h1 className="text-center">
          START ADDING ITEMS TO CREATE A SALE ORDERS
        </h1>
      ) : (
        <div className="w-full ">
                    <Separator />
          <Table className="w-full">
            <TableCaption>
              View your list of orders before creating a Sales order.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-lg" colSpan={8}>
                  {capitalize(orders[0].shopName)}
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="text-center">DELETE</TableHead>
                <TableHead className="text-center">NAME</TableHead>
                <TableHead className="text-center">QTY</TableHead>
                <TableHead className="text-center">PRICE</TableHead>
                <TableHead className="text-center">DISCOUNT</TableHead>
                <TableHead className="text-center">GST</TableHead>
                <TableHead className="text-right">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.productId}>
                  <TableCell>
                    <Button
                      onClick={() => removeFromOrder(order.productId)}
                      variant="outline"
                      className="w-full text-white hover:text-red-600"
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                    {capitalize(order.companyName)} {capitalize(order.productName)}
                  </TableCell>
                  <TableCell className="text-center">{order.qty}</TableCell>
                  <TableCell className="text-center truncate">
                    {formatCurrency(
                      order.salePrice - order.salePrice * (order.gst / 100)
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(Number(order.discountAmount))}({order.discount}%)
                  </TableCell>
                  <TableCell className="text-center whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                    {formatCurrency(order.gstAmount)} ({order.gst}%)
                  </TableCell>
                  <TableCell className="text-right   whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                    {formatCurrency(order.total)} ({order.salePrice - order.discountAmount} X {order.qty})
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell
                  className="text-right"
                  colSpan={window.innerWidth > 640 ? 6 : 6}
                >
                  Total
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    Number(
                      orders?.reduce((grandTotal, order) => {
                        return grandTotal + Number(order.total);
                      }, 0) 
                    ).toFixed(2)
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </>
  );
}
