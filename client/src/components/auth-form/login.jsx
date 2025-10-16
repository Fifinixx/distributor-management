import { useState } from "react";

import Particles from "./particles";

import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/shadcn-io/spinner";
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

export default function Login({ handleLogin, credentials, setCredentials }) {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e){
    e.preventDefault(); 
    setLoading(true);
    await handleLogin();
    setLoading(false);
  }
  return (
    <>
      <div className="relative w-full h-full">
        <div className="relative w-full h-[100vh]">
          <Particles
            particleColors={["#ffffff", "#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
      </div>
      <Card className="w-full max-w-sm absolute">
        <h1 className="text-center">MAA TARA TRADERS</h1>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={e => onSubmit(e)}>
        <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials((prev) => {
                      return { ...prev, email: e.target.value };
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  value={credentials.password}
                  type="password"
                  name="password"
                  id="password"
                  required
                  onChange={(e) =>
                    setCredentials((prev) => {
                      return { ...prev, password: e.target.value };
                    })
                  }
                />
              </div>
            </div>
         
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
          disabled={loading}
            type="submit"
            className="w-full mt-4"
          >
            {loading ? <Spinner /> : "Login"}
          </Button>
        </CardFooter>
        </form>
      </Card>
    </>
  );
}
