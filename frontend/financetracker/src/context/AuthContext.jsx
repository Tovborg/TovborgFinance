// src/context/AuthContext.jsx
import { Children, createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState(null);

    useEffect(() => {
        if (jwt && !user) {
            axios
                .get("http://127.0.0.1:8000/auth/me", {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                })
                .then((res) => setUser(res.data))
                .catch(() => logout()); // Logout if token is invalid
        }
    }, [jwt]);

    const login = async (googleAccessToken) => {
        try {
            // Send google access token to backend
            const jwtRes = await axios.post("http://127.0.0.1:8000/auth/google",null, {
                headers: {
                    Authorization: `Bearer ${googleAccessToken}`,
                }
            });
            // Save JWT token to state
            const token = jwtRes.data.access_token;
            setJwt(token);
            // Use token to get user data
            const meRes = await axios.get("http://127.0.0.1:8000/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(meRes.data);
        } catch (error) {
            console.error("Login error", error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("jwt");
        setJwt(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, jwt, login, logout }}>
          {children}
        </AuthContext.Provider>
      );
};

export const useAuth = () => useContext(AuthContext);