import { useState, useEffect } from "react";

import { Button } from "../ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { formatCurrency } from "../../lib/utils";

export default function Performance() {
  const [performance, setPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  async function fetchPerformance() {
    try {
      const res = await fetch(`${baseUrl}/dashboard/performance`, {
        credentials: "include",
      });
      if (res.ok) {
        setLoading(false);
        const data = await res.json();
        const currentMonthIndex = new Date().getMonth() + 1;
        const filteredData = {
          purchases: data.purchases.filter(
            (item) => item._id.month === currentMonthIndex
          ),
          sales: data.sales.filter(
            (item) => item._id.month === currentMonthIndex
          ),
        };
        setPerformance(filteredData);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to load stats");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPerformance();
  }, []);

  const totalPurchases = Number(
    performance?.purchases?.[0]?.totalPurchases?.$numberDecimal ?? 0
  );
  const totalDamageDiscount = Number(
    performance?.purchases?.[0]?.totalDamageDiscount?.$numberDecimal ?? 0
  );
  const totalSales = Number(
    performance?.sales?.[0]?.totalSales?.$numberDecimal ?? 0
  );
  const netProfit = totalSales - totalPurchases + totalDamageDiscount;
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
            <CardTitle>THIS MONTH</CardTitle>
            <CardDescription>Profit and Loss</CardDescription>
          </CardHeader>
          <CardContent className="text-sm flex flex-col justify-center gap-3">
            <div className="flex justify-between gap-4 items-center">
              <p>Total Purchases made this month</p>
              <p className="text-red-500">{formatCurrency(totalPurchases)}</p>
            </div>
            <div className="flex justify-between  gap-4 items-center">
              <p>Total Sales made this month</p>
              <p className="text-green-500">{formatCurrency(totalSales)}</p>
            </div>
            <div className="flex justify-between  gap-4 items-center">
              <p>Damaged goods</p>
              <p className="text-red-500"> - {formatCurrency(0)}</p>
            </div>
            <div className="flex justify-between  gap-4 items-center">
              <p>Damage Discount</p>
              <p className="text-green-500">
                + {formatCurrency(totalDamageDiscount)}
              </p>
            </div>
            <div className="flex justify-between  gap-4 items-center">
              <p>Net Profit</p>
              <p
                className={`${
                  netProfit > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(netProfit)}
              </p>
            </div>
            <CardFooter className="w-full p-0">
              <Link className="w-full" to="/dashboard/inventory">
                <Button className="cursor-pointer w-full">REPORTS</Button>
              </Link>
            </CardFooter>
          </CardContent>
        </Card>
      )}
    </>
  );
}
