// src/context/AuthContext.jsx
import { Children, createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [jwt, setJwt] = useState(() => localStorage.getItem("jwt"));

    useEffect(() => {
        if (jwt && !user) {
            axios
                .get("http://127.0.0.1:8000/auth/me", {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                })
                .then((res) => setUser(res.data))
                .catch(() => logout()) // Logout if token is invalid
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false); // Set loading to false if no token or user is present
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
            localStorage.setItem("jwt", token); // Save token to local storage
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
        <AuthContext.Provider value={{ user, jwt, login, logout, isLoading }}>
          {children}
        </AuthContext.Provider>
      );
};

export const useAuth = () => useContext(AuthContext);