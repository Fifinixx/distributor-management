const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState({
    status: "auth-failure",
    loading: true,
    email: null,
    name: null,
    _id: null,
    role:null
  });
  async function checkAuth() {
    try {
      const res = await fetch(`${baseUrl}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          status: "auth-success",
          loading: false,
          email: data.email,
          name: data.name,
          _id: data._id,
          role:data.role
        });
      } else {
        setUser({
          status: "auth-failure",
          loading: false,
          email: null,
          name: null,
          _id: null,
          role:null
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    checkAuth();
  }, []);

  return { ...user, refreshAuth: checkAuth };
}
