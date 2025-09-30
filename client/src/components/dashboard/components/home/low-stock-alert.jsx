import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { ProductList } from "../../services/products";
import { capitalize } from "../../../../lib/utils";

export default function LowStockAlert() {
  const [lowStockProducts, setLowstockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  async function fetchProducts() {
    try {
      const res = await ProductList(
        "",
        "",
        "",
        false,
        { inStock: true, outOfStock: true },
        0,
        5
      );
      if (res.ok) {
        const data = await res.json();
        setLowstockProducts(data.products.slice(0, 5));
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Error while fetching products");
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchProducts();
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
        <Card className="px-4 flex justify-center w-full lg:w-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <Badge variant="secondary">{lowStockProducts.length} items</Badge>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <Table className="text-center">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center text-lg">
                      Product
                    </TableHead>
                    <TableHead className="text-center text-lg">
                      Stock Left
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{capitalize(product.name)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-600"
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground  text-center text-sm">
                All products are sufficiently stocked ✅
              </p>
            )}
          </CardContent>
          <Link to="/dashboard/inventory" className="w-full">
              <Button className="w-full cursor-pointer">VIEW ALL PRODUCTS</Button>
            </Link>
        </Card>
      )}
    </>
  );
}
