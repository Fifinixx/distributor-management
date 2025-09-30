import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router";

import useAuth from "../auth/check-auth";
import Login from "./auth-form/login";
import Signup from "./auth-form/signup";

import { toast } from "sonner";

import { useAppContext } from "../app-context";
import { Spinner } from "./ui/shadcn-io/spinner";

export default function AuthForm() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const { status, refreshAuth } = useAppContext();
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

  if (status === "auth-success") {
    return <Navigate to="/dashboard" />;
  }

  function handleErrors() {
    let err = false;
    if (credentials.email === "") {
      toast.error("Email cannot be empty")
      return err = true;
    }
    if (credentials.password === "") {
      toast.error("Password cannot be empty")
      return err = true;
    }
    return err;
  }
  async function handleLogin() {
    if (!handleErrors()) {
      try {
        const res = await fetch(`${baseUrl}/auth/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          credentials: "include",
        });
        if (res.ok) {
          await refreshAuth();
          navigate("/dashboard", { replace: true });
          return;
        }else {
          const data = await res.json();
          const message = data.message;
          throw new Error(`${message ? message : "Error while logging in"}`);
          }
      } catch (e) {
        console.error("Signup failure: ", e);
        toast.error(e.message);
        }
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center gap-8 ">
          <Login
            handleLogin={handleLogin}
            credentials={credentials}
            errors={errors}
            setCredentials={setCredentials}
          />
      </div>
    </>
  );
}
