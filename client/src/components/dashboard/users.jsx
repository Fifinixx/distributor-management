import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Spinner } from "../ui/shadcn-io/spinner";
import { Trash2 } from "lucide-react";

import { useAppContext } from "../../app-context";

import { formatDate } from "../../lib/utils";
import { Navigate } from "react-router";

export default function Users() {
  const {role} = useAppContext();
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
//   if(role !== "admin"){
//     return <Navigate  to="/dashboard/404"/>
//   }
  const [loading, setLoading] = useState({ users: true, addUser: false });
  const [users, setUsers] = useState([]);
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  async function fetchUsers() {
    try {
      const res = await fetch(`${baseUrl}/dashboard/users`, {
        credentials: "include",
      });
      if (res.ok) {
        setLoading((prev) => ({ ...prev, users: false }));
        const data = await res.json();
        console.log(data.users);
        setUsers(data.users);
      } else {
        throw new Error(`${res.status} failed to fetch users`);
      }
    } catch (e) {
      setLoading((prev) => ({ ...prev, users: false }));
      console.error(e);
      toast.error(e.message);
    }
  }
  async function handleSignup() {
    if (
      !credentials.name ||
      !credentials.email ||
      !credentials.password ||
      !credentials.role
    ) {
      toast.error("Fields cannot be blank");
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, addUser: true }));
      const res = await fetch(`${baseUrl}/dashboard/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
          role: credentials.role,
          permissions: credentials.permissions,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setLoading((prev) => ({ ...prev, addUser: false }));
        toast.success("User added sucesfully");
        fetchUsers();
      } else {
        const data = await res.json();
        const message = data.message;
        setLoading((prev) => ({ ...prev, addUser: false }));
        throw new Error(`${res.status} ${message ? message : "Error while adding user"}`);
      }
    } catch (e) {
      setLoading((prev) => ({ ...prev, addUser: false }));
      console.error("Signup failure: ", e);
      toast.error(e.message);
    }
  }
  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="container flex justify-around items-start">
      <Card className="w-1/2">
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
        <div className="w-1/2 flex flex-col p-2 items-center justify-center gap-2">
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
