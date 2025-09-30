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

export default function Activity(){
    return <>
            <Card>
          <CardHeader>
            <CardTitle>RECTENT ACTIVITY</CardTitle>
            <CardDescription>Quick summary of your inventory</CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-2">
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

              <Link className="w-full" to="/dashboard/inventory">
                <Button className="cursor-pointer w-full">INVENTORY</Button>
              </Link>

          </CardContent>
        </Card>
    </>
}