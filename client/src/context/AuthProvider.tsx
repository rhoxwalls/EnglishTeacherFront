// src/context/AuthProvider.tsx
import { useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import { AuthContext, type User } from './AuthContext'; // Importamos el contexto que creamos en el Paso 1

// ÚNICA EXPORTACIÓN ACTIVA: El componente React
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkPersistedLogin = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me'); 
        setUser(data);
      } catch (error) {
        console.error("Token inválido o expirado. Sesión limpiada.", error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false); 
      }
    };

    checkPersistedLogin();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

