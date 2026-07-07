// src/context/AuthContext.ts
import { createContext } from 'react';

// Exportamos las interfaces para poder usarlas en otros archivos
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// ÚNICA EXPORTACIÓN ACTIVA: El objeto del contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);