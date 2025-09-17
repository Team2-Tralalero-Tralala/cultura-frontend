import { useContext } from "react";
import { AuthContext } from "./AuthProviders";

export const useAuth = () => {
  const { user, login, register, logout } = useContext(AuthContext);

  return { user, login, register, logout };
};
