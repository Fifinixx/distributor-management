import { useState, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
  LabelList,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toast } from "sonner";

export const description = "A linear line chart";
import { formatCurrency } from "../../../../lib/utils";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const chartConfig = {
  desktop: {
    label: "Profit",
    color: "var(--chart-1)",
  },
};

export default function ProfitChart() {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(false);
  async function fetchPerformance() {
    try {
      const res = await fetch(`${baseUrl}/dashboard/performance`, {
        credentials: "include",
      });
      if (res.ok) {
        setLoading(false);
        const data = await res.json();
        const chartData = months.map((item, index) => ({
          month: item,
          profit:
            Number(
              data.sales.find((item) => item._id.month === index + 1)
                ?.totalSales.$numberDecimal ?? 0
            ) -
            Number(
              data.purchases.find((item) => item._id.month === index + 1)
                ?.totalPurchases.$numberDecimal ?? 0
            ) +
            Number(
              data.purchases.find((item) => item._id.month === index + 1)
                ?.totalDamageDiscount.$numberDecimal ?? 0
            ),
        }));
        setChart(chartData);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit/Loss 2025</CardTitle>
        <CardDescription>January - December 2025</CardDescription>
      </CardHeader>
      <CardContent className="h-[200px] sm:h-[300px] lg:h-[300px] ">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={chart}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickMargin={8}
              tick={{ angle: -45, textAnchor: "end" }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis dataKey="profit" />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <ReferenceLine y={0} stroke="#aaa" strokeDasharray="3 3" />
            <Line
              dataKey="profit"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, value, index } = props;
                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={value >= 0 ? "green" : "red"}
                  />
                );
              }}
            >
              <LabelList
                dataKey="profit"
                formatter={(val) => {return formatCurrency(val)}}
                offset={6} // space between label and dot/line
                content={({ x, y, value }) => {
                  return (
                    <text
                      x={x}
                      y={y - 5}
                      textAnchor="right"
                      fill={value > 0 ? "green" : "red"}
                      fontSize={10}
                      fontWeight={500}
                    >
                      {formatCurrency(value)}
                    </text>
                  );
                }}
                style={{ fontSize: 12, fontWeight: 500 }}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing total profit for the current year
        </div>
      </CardFooter>
    </Card>
  );
}
