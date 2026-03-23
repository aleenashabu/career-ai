import { createContext, useContext, useEffect, useState } from "react";
import { Commet } from "react-loading-indicators"

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const backendUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('token');


  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      // Rehydrate user from localStorage
      setCurrentUser({ role });
    }

    setLoading(false); // Done checking
  }, []);

    const register = async ({ fullName, email, password, educationBg }) => {

        const res = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password, educationBg })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        return data;
    };

    const login = async ({ email, password }) => {

        try {
            const res = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setCurrentUser({ ...data.user, role: data.role });
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            return data;
        } catch (err) {
            // Re-throw to surface in Login.jsx
            throw err;
        }
    };

    const adminLogin = async ({ email, password }) => {
        try {
            const res = await fetch(`${backendUrl}/api/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Admin login failed');
            }
            setCurrentUser({ ...data.user, role: data.role });
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            return data;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, register, login, adminLogin, logout }}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <Commet color="#59bed7" size="large" text="" />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
