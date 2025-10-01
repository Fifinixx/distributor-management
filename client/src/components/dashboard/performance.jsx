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
    <div className="container flex flex-col  justify-around items-start sm:flex-row">
      <Card className="w-full sm:w-1/2">
        <CardHeader>
          <CardTitle>Create a new User</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  value={credentials.name}
                  id="name"
                  name="name"
                  type="text"
                  required
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={credentials.email}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  value={credentials.password}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <RadioGroup
                onValueChange={(value) => {
                  setCredentials((prev) => ({ ...prev, role: value }));
                }}
                className="flex justify-center items-center"
                value={credentials.role}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="read" id="read" />
                  <Label htmlFor="read">Read</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="read/write" id="read/write" />
                  <Label htmlFor="admin">Read/Write</Label>
                </div>
              </RadioGroup>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            disabled={loading.addUser}
            onClick={handleSignup}
            type="button"
            className="w-full"
          >
            {loading.addUser ? <Spinner /> : "Create"}
          </Button>
        </CardFooter>
      </Card>
      {users.length == 0 ? (
        <div className="w-1/2  p-2">
          <p>No users found</p>
        </div>
      ) : (
        <div className="w-full flex flex-col p-2 items-center justify-center gap-2 sm:w-1/2">
          <p className="text-center">Existing users</p>
          {users.map((user) => {
            return (
              <Card className="w-full p-1" key={user._id}>
                <CardContent className="text-xs w-full flex justify-between p-1 items-center">
                  <p >{user.name}</p>
                  <p >{user.role}</p>
                  <p >{user.email}</p>
                  <p >{formatDate(user.createdAt)}</p>
                  <p > <Trash2 /></p>
                 
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
