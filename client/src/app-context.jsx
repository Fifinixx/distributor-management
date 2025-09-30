import { createContext, useContext } from "react";
import useAuth from "./auth/check-auth";

const Context = createContext();

export function AppContext({ children }) {
const {status, loading, name, email, refreshAuth, _id, role} = useAuth();
  return (
    <Context.Provider value={{status, loading, name, email, refreshAuth, _id, role}}>
      {children}
    </Context.Provider>
  );
}

export function useAppContext() {
  return useContext(Context);
}
