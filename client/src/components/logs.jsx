import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/shadcn-io/spinner";

import { formatDate } from "../lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppContext } from "../app-context";
import { Navigate } from "react-router";
export default function Logs() {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  const {role} = useAppContext();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1);
  if(role !== "admin"){
    return <Navigate to="/dashboard/404"/>
  }
  async function fetchLogs() {
    try {
      const res = await fetch(
        `${baseUrl}/dashboard/logs?page=${page}&limit=10`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs)
        console.log(data);
        setLoading(false);
      }else{
        setLoading(false);
        toast.error("Failed to load logs");
      }
    } catch (e) {
      toast.error("Failed to load logs");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="w-full flex flex-col gap-4">
          {logs.length === 0 ? (
            <h1 className="text-center">No Logs found</h1>
          ) : (
            logs.map((item) => {
              return (
                <Card className="w-full border-none p-2" key={item._id}>
                  <CardContent className="w-full">
                    <div className="flex justify-start gap-4 items-center text-xs">
                    <p className="font-bold">{item.user.name}</p>
                      <p className="">{item.action}</p>
                      <p className="">{formatDate(item.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
