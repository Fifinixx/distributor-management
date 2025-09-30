import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductList } from "../../services/products";
import { toast } from "sonner";

import { formatCurrency } from "../../../../lib/utils";

export default function InventorySnap() {
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({});
  const [loading, setLoading] = useState(true);
  async function fetchRecentItems() {
    try {
      const res = await ProductList(
        "",
        "",
        { id: "", name: "" },
        false,
        { inStock: false, outOfStock: false },
        0,
        0
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setLoading(false);
        setProductStats({
          inStock: data.products.reduce(
            (sum, item) => sum + (item.stock > 0 ? 1 : 0),
            0
          ),
          outOfStock: data.products.reduce(
            (sum, item) => sum + (item.stock === 0 ? 1 : 0),
            0
          ),
          totalValue: data.products.reduce(
            (sum, item) => sum + item.stock * item.avgPrice.$numberDecimal,
            0
          ),
        });
      }
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong while fetching products");
    }
  }
  useEffect(() => {
    fetchRecentItems();
  }, []);
  return (
    <>
      {loading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[100px] w-full rounded-xl" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 " />
            <Skeleton className="h-4 " />
            <Skeleton className="h-4 " />
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>INVENTORY GLANCE</CardTitle>
            <CardDescription>Quick summary of your inventory</CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col text-sm justify-between h-full gap-2">
            <div className="flex flex-col text-sm justify-center gap-2">
            {products.length === 0 ? (
              <p>No Products found</p>
            ) : (
              <>
                <p>
                  {products.length} products ({productStats.inStock} in stock,{" "}
                  {productStats.outOfStock} out of stock)
                </p>
                <p>
                  Total value of stock:
                  <span className="text-green-500">
                    {" " + formatCurrency(productStats.totalValue)}
                  </span>
                </p>
              </>
            )}
            </div>
            <CardFooter className="p-0">
              <Link className="w-full" to="/dashboard/inventory">
                <Button className="cursor-pointer w-full">INVENTORY</Button>
              </Link>
            </CardFooter>
          </CardContent>
        </Card>
      )}
    </>
  );
}
