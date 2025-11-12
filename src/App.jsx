import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- PROVEDORES ---
import { AuthProvider } from './contexts/AuthContext';
import { MonthProvider } from './contexts/MonthContext'; 
import { Toaster } from './components/ui/Toaster';

// --- COMPONENTES DE LAYOUT E ROTA ---
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout'; // O seu Layout.jsx

// --- PÁGINAS ---
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts'; // A página da LISTA
import AccountDetail from './pages/AccountDetail'; // 1. IMPORTADO O NOVO COMPONENTE
import Categories from './pages/Categories';
import Settings from './pages/Settings'; 
import Transactions from './pages/Transactions'; 

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MonthProvider>
          <Toaster /> 
          
          <Routes>
            {/* 🔐 Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<RecoverPassword />} />

            {/* 🔒 Área protegida */}
            <Route
              element={
                <PrivateRoute> 
                  <Layout />
                </PrivateRoute>
              }
            >
              {/* Redireciona a raiz / para o dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Módulos principais */}
              <Route path="/transactions" element={<Transactions />} />
              
              {/* --- 2. ROTAS DE CONTAS CORRIGIDAS --- */}
              {/* /accounts é a página da lista */}
              <Route path="/accounts" element={<Accounts />} /> 
              {/* /accounts/:id é a página de detalhes (o carrossel) */}
              <Route path="/accounts/:id" element={<AccountDetail />} /> 

              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Redirecionamento padrão para qualquer outra rota */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </MonthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}