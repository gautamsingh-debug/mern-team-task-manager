import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.get("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password) => {
    const res = await API.post("/auth/signup", { name, email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Update local user state after profile changes
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...stored, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, updateUser, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}
