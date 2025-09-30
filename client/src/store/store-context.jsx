import { createContext } from "react";
import { useState } from "react";

export const UserContext = createContext({
  email: null,
  setEmail: () => {}
});

export function UserProvider({ children }) {
  const [email, setEmail] = useState(null);
  return (
    <>
      <UserContext value={{ email: email, setEmail:setEmail }}>{children}</UserContext>
    </>
  );
}
