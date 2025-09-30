import { Input } from "../../../../ui/input";
import { Trash2 } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Separator } from "../../../../ui/separator";
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
import { formatCurrency,capitalize } from "../../../../../lib/utils";
export default function PurchaseOrderList({ orders, removeFromOrder, inputs }) {
  const subTotal = Number( orders.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  const total = subTotal - inputs.discountAmount;
  return (
    <>
      {orders.length === 0 ? (
        <h1 className="text-center">START ADDING ITEMS TO CREATE AN ORDER</h1>
      ) : (
        <div className="w-full">
          <Separator />
          <Table className="w-full">
            <TableCaption>
              View your list of orders before creating an order.
            </TableCaption>
            <TableHeader>
              <TableRow className="text-center">
                <TableCell className="text-xl" colSpan={8}>
                  {orders[0].companyName.toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="text-center w-[50px] sm:w-auto">DELETE</TableHead>
                <TableHead className="text-left lg:text-center">NAME</TableHead>
                <TableHead className="text-center">QTY</TableHead>
                <TableHead className="text-center">AMT</TableHead>
                <TableHead className="text-center">EXP</TableHead>
                <TableHead className="text-center">PRICE</TableHead>
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
                  <TableCell className="whitespace-normal break-words max-w-[55px] sm:max-w-[250px] text-left lg:text-center">
                    {capitalize(order.productName)}
                  </TableCell>
                  <TableCell className="text-center">{order.qty}</TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(Number(order.amount).toFixed(2))}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(Number(order.misc ? order.misc : 0).toFixed(2))}
                  </TableCell>
                  <TableCell className="text-center">{formatCurrency(Number(order.price.toFixed(2)))}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.total.toFixed(2))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="text-right" colSpan={6}>
                 Sub total
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                   subTotal
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell  className="text-right" colSpan={6}>
                   Damage discount
                </TableCell>
                <TableCell className="text-right">
                  - { formatCurrency(inputs.discountAmount ? inputs.discountAmount : 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell  className="text-right" colSpan={6}>
                   Total
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </>
  );
}
