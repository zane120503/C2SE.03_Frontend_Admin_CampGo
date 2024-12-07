import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authHeader, setAuthHeader] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setAuthHeader(`Bearer ${token}`);
        }
    }, []);

    const login = (userData, header) => {
        setUser(userData);
        setAuthHeader(header);
        console.log("Auth header set:", header);
    };

    const logout = () => {
        setUser(null);
        setAuthHeader(null);
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ user, authHeader, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
