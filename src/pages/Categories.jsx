import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Tag,
  Trash2,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet';

export default function Categories() {
  const { categories, refreshCategories } = useCategories();
  const { activeHousehold } = useAuth();
  
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("expense"); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Categorias sugeridas (CORRIGIDO: 'tipo' padronizado para 'expense'/'income') ---
  const suggested = [
    { nome: "Alimentação", tipo: "expense", color_hex: "#22C55E", icon_name: "utensils" },
    { nome: "Transporte", tipo: "expense", color_hex: "#3B82F6", icon_name: "car" },
    { nome: "Educação", tipo: "expense", color_hex: "#A855F7", icon_name: "book" },
    { nome: "Saúde", tipo: "expense", color_hex: "#EF4444", icon_name: "heart" },
    { nome: "Salário", tipo: "income", color_hex: "#16A34A", icon_name: "wallet" },
    { nome: "Investimentos", tipo: "income", color_hex: "#0EA5E9", icon_name: "trending-up" },
  ];

  // --- Criar nova categoria ---
  const handleAddCategory = async () => {
    if (!newName.trim()) return;
    if (!activeHousehold?.id) {
      console.error("Nenhuma família (household) ativa.");
      return;
    }
    
    try {
      setLoading(true);
      // Esta função estava correta: ela salva 'newName' em 'nome'
      await supabase.from("categories").insert([
        {
          household_id: activeHousehold.id, 
          nome: newName.trim(), // Salva o nome digitado
          tipo: newType, // Salva 'expense' or 'income'
          color_hex: newType === "expense" ? "#EF4444" : "#16A34A",
        },
      ]);
      setNewName("");
      setNewType("expense");
      refreshCategories(); 
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
    } finally {
      setLoading(false);
      setCreating(false);
    }
  };

  // --- Adicionar sugestão ---
  const handleAddSuggested = async (cat) => {
    if (!activeHousehold?.id) return;
    try {
      const existing = categories.find(c => c.nome === cat.nome && c.tipo === cat.tipo);
      if (existing) return; 

      await supabase.from("categories").insert([
        { ...cat, household_id: activeHousehold.id },
      ]);
      refreshCategories(); 
    } catch (err) {
      console.error("Erro ao adicionar categoria sugerida:", err);
    }
  };

  // --- Remover categoria ---
  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await supabase.from("categories").delete().eq("id", id);
      refreshCategories(); 
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Categorias - FinanceApp</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto backdrop-blur-xl bg-white/75 border border-white/30 rounded-3xl shadow-lg p-6 space-y-8"
      >
        {/* Título */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-slate-900">Categorias</h1>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setCreating((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Nova
          </motion.button>
        </div>

        {/* Campo de criação */}
        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col md:flex-row gap-3 bg-white/60 backdrop-blur-lg border border-black/40 p-4 rounded-xl"
            >
              <input
                type="text"
                placeholder="Nome da categoria..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Dropdown customizado */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center justify-between w-36 px-3 py-2 rounded-lg shadow-sm backdrop-blur-md border border-white/40 transition-all ${
                    newType === "expense"
                      ? "bg-red-50/60 text-red-600 hover:bg-red-100/60"
                      : "bg-green-50/60 text-green-600 hover:bg-green-100/60"
                  }`}
                >
                  <span className="capitalize">{newType === 'expense' ? 'Despesa' : 'Receita'}</span>
                  <motion.div
                    animate={{ rotate: menuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute mt-2 w-36 rounded-xl border border-white/40 shadow-md backdrop-blur-md bg-white/70 overflow-hidden z-20"
                    >
                      {/* Item: Despesa */}
                      <motion.li
                        whileHover={{ backgroundColor: "rgba(254,226,226,0.8)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setNewType("expense");
                          setMenuOpen(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 text-sm text-red-600 cursor-pointer select-none"
                      >
                        Despesa
                        {newType === "expense" && (
                          <Check className="w-4 h-4 text-red-500" />
                        )}
                      </motion.li>

                      {/* Item: Receita */}
                      <motion.li
                        whileHover={{ backgroundColor: "rgba(220,252,231,0.8)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setNewType("income");
                          setMenuOpen(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 text-sm text-green-600 cursor-pointer select-none"
                      >
                        Receita
                        {newType === "income" && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </motion.li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Botão adicionar */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddCategory}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {loading ? "Salvando..." : "Adicionar"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categorias existentes */}
        <div>
          <h2 className="text-md font-medium text-slate-800 mb-3">
            Minhas Categorias
          </h2>

          {categories?.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl backdrop-blur-lg bg-white/60 border border-white/40 shadow-sm flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <Tag
                      className="w-5 h-5"
                      style={{ color: cat.color_hex || "#4F46E5" }}
                    />
                    <div>
                      {/* 👇 CORREÇÃO AQUI: 'cat.name' mudado para 'cat.nome' 👇 */}
                      <p className="font-medium text-gray-800">{cat.nome}</p> 
                      <p className="text-xs text-gray-500 capitalize">{cat.tipo === 'expense' ? 'Despesa' : 'Receita'}</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(cat.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma categoria criada ainda.</p>
          )}
        </div>

        {/* Sugestões inteligentes */}
        <div>
          <h2 className="text-md font-medium text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Sugestões Populares
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggested.map((cat) => (
              <motion.div
                key={cat.nome}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleAddSuggested(cat)}
                className="cursor-pointer select-none p-4 rounded-xl border border-white/40 backdrop-blur-lg bg-blue-50/60 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <Tag
                    className="w-5 h-5"
                    style={{ color: cat.color_hex }}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{cat.nome}</p>
                    <p className="text-xs text-gray-500 capitalize">{cat.tipo === 'expense' ? 'Despesa' : 'Receita'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}