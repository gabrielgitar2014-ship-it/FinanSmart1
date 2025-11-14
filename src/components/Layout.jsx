// Adicionado 'useState' e 'useRef'
import  { useState, useRef } from 'react'; 
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, CreditCard, Tag, LogOut, Menu, X, List, 
  Settings, ChevronLeft, ChevronRight, Plus 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/MonthContext'; 
import { Button } from '../components/ui/Button';

import AddTransactionModal from '../components/AddTransactionModal';
import { useCategories } from '../hooks/useCategories';


const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { displayMonth, nextMonth, previousMonth } = useMonth();

  const constraintsRef = useRef(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const { categories } = useCategories();

  // --- MUDANÇA (1): Estado para controlar o "arrastar" ---
  // Este estado vai diferenciar um clique de um arrasto.
  const [isDragging, setIsDragging] = useState(false);
  // --- FIM DA MUDANÇA (1) ---

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: List, label: 'Transações' },
    { path: '/accounts', icon: CreditCard, label: 'Contas' },
    { path: '/categories', icon: Tag, label: 'Categorias' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div 
      ref={constraintsRef} 
      className="min-h-screen bg-gradient-to-br from-white via-sky-100 to-blue-200 bg-fixed"
    >
      
      {/* Navbar (sem alteração) */}
      <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-lg border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg" />
                <span className="text-xl font-bold text-slate-900">FinanceApp</span>
              </motion.div>
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
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={previousMonth} className="text-slate-600 hover:text-slate-900 hover:bg-gray-100">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-semibold text-gray-700 w-32 text-center">{displayMonth}</span>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="text-slate-600 hover:text-slate-900 hover:bg-gray-100">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <Button variant="ghost" onClick={handleSignOut} className="text-slate-600 hover:text-slate-900 hover:bg-gray-100">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-700 hover:text-slate-900">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200"
          >
            <div className="flex items-center justify-center gap-2 px-3 py-3 border-b border-gray-200">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-base font-semibold text-gray-700 w-40 text-center">{displayMonth}</span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-gray-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              <button onClick={handleSignOut} className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-gray-100 hover:text-slate-900">
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Conteúdo da Página */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ openTransactionModal: () => setIsAddTransactionModalOpen(true) }} />
      </main>

      {/* --- FAB (Floating Action Button) --- */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        
        // --- MUDANÇA (2): Lógica de Drag vs. Tap ---
        // Ao começar a arrastar, ativa a flag
        onDragStart={() => setIsDragging(true)}

        // Ao soltar, desativa a flag após um pequeno delay
        // Isso previne que o 'onTap' dispare acidentalmente
        onDragEnd={() => {
          setTimeout(() => {
            setIsDragging(false);
          }, 50); // 50ms de delay
        }}
        
        // O 'onTap' (clique) só abre o modal se a flag 'isDragging' for falsa
        onTap={() => {
          if (!isDragging) {
            setIsAddTransactionModalOpen(true);
          }
        }}
        // --- FIM DA MUDANÇA (2) ---
        
        className="fixed z-40 cursor-grab"
        style={{ bottom: '3rem', right: '2rem' }}
        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        
        whileHover={{ 
          scale: 1.1, 
          rotate: 90, 
          transition: { type: 'spring', stiffness: 300, damping: 10 }
        }}
      >
        <Button 
          size="icon" 
          // --- MUDANÇA (3): Tamanho aumentado ---
          className="rounded-full w-16 h-16 shadow-lg bg-blue-600 hover:bg-blue-700"
          // --- FIM DA MUDANÇA (3) ---
          aria-label="Adicionar Transação"
        >
          {/* --- MUDANÇA (4): Ícone aumentado --- */}
          <Plus className="w-7 h-7" />
          {/* --- FIM DA MUDANÇA (4) --- */}
        </Button>
      </motion.div>


      {/* Modal Global */}
      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default Layout;