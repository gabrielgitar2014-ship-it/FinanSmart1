import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CreditCard, 
  Tag, 
  LogOut, 
  Menu, 
  X, 
  List, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/MonthContext'; 
import { Button } from '../components/ui/Button';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { displayMonth, nextMonth, previousMonth } = useMonth();

  // 👇 ESTA É A FUNÇÃO QUE FALTAVA. EU A ADICIONEI DE VOLTA. 👇
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Adicionadas as novas páginas
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: List, label: 'Transações' },
    { path: '/accounts', icon: CreditCard, label: 'Contas' },
    { path: '/categories', icon: Tag, label: 'Categorias' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    // Fundo da página (azul céu)
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-100 to-blue-200 bg-fixed">
      
      {/* Navbar de "vidro" claro */}
      <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-lg border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Lado Esquerdo: Logo e Abas */}
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg" />
                <span className="text-xl  font-bold text-slate-900">FinanSmart</span>
              </motion.div>

              {/* Abas do Desktop */}
              <div className="hidden md:flex ml-10 space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 font-semibold' 
                            : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900' 
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Lado Direito: Seletor de Mês e Botão Sair */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Seletor de Mês (Desktop) */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={previousMonth} 
                  className="text-slate-600 hover:text-slate-900 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-semibold text-gray-700 w-32 text-center">
                  {displayMonth}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={nextMonth} 
                  className="text-slate-600 hover:text-slate-900 hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Botão Sair (Desktop) */}
              <Button
                variant="ghost"
                onClick={handleSignOut} // Esta chamada agora funciona
                className="text-slate-600 hover:text-slate-900 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Botão do Menu Mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-700 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200"
          >
            {/* Seletor de Mês (Mobile) */}
            <div className="flex items-center justify-center gap-2 px-3 py-3 border-b border-gray-200">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={previousMonth}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-base font-semibold text-gray-700 w-40 text-center">
                {displayMonth}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Abas do Menu Mobile */}
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-700 hover:bg-gray-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              {/* Botão Sair (Mobile) */}
              <button
                onClick={handleSignOut} // Esta é a linha 113 (aprox.) que estava falhando
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-gray-100 hover:text-slate-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;