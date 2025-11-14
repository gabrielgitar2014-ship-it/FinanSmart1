import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, ChevronRight, Layers } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useToast } from '../components/ui/use-Toast';

// Hooks de dados que o modal precisa
import { useTransactions } from '../hooks/useTransactions'; 
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useCategories } from '../hooks/useCategories';

/* ===============================
   Funções Auxiliares (sem mudanças)
   =============================== */
const getBillingMonth = (transactionDate, closeDay) => {
  const d = new Date(transactionDate);
  const billingDate = new Date(d);
  if (d.getDate() > closeDay) {
    billingDate.setMonth(d.getMonth() + 1);
  }
  return billingDate;
};
const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); 
};

// ===================================================================
// O COMPONENTE PRINCIPAL DO MODAL (AGORA SÓ DE DESPESAS)
// ===================================================================
const AddTransactionModal = ({ isOpen, onClose }) => {
  // 1. O modal agora busca seus próprios dados
  const { refreshTransactions, addTransaction } = useTransactions();
  const { methods: paymentMethods } = usePaymentMethods();
  const { categories } = useCategories();
  
  const { user, activeHousehold } = useAuth();
  const { toast } = useToast();

  // 2. Removemos o estado 'tipo'. É sempre 'expense'.
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethodId, setPaymentMethodId] = useState(""); 
  const [categoryId, setCategoryId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState(2); 
  const [loading, setLoading] = useState(false);

  // 3. Filtra apenas categorias de DESPESA
  const expenseCategories = categories.filter(c => c.tipo === 'expense');

  const selectedMethod = paymentMethods?.find((m) => m.id === paymentMethodId);
  const isCredit = selectedMethod?.tipo === "credit_card";
  const showInstallments = isCredit; // Mostra parcelas se for cartão de crédito

  // Efeito de Reset (Simplificado)
  useEffect(() => {
    if (isOpen) {
      setDescricao('');
      setValor('');
      setData(new Date().toISOString().split('T')[0]);
      setPaymentMethodId(paymentMethods[0]?.id || '');
      setCategoryId(expenseCategories[0]?.id || '');
      setObservacoes('');
      setParcelado(false);
      setTotalParcelas(2);
      setLoading(false);
    }
  }, [isOpen, paymentMethods, expenseCategories]);


  /* ===============================
     Função principal: salvar DESPESA
     =============================== */
  const handleSave = async () => {
    if (!descricao || !valor || !paymentMethodId || !categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      if (!user || !activeHousehold?.id) throw new Error("Usuário ou Família não autenticados.");

      let billingDate = parseLocalDate(data);
      if (isCredit && selectedMethod?.close_day) { 
        billingDate = getBillingMonth(data, selectedMethod.close_day);
      }
      const valorNum = parseFloat(valor.replace(",", "."));
      const household_id = activeHousehold.id;

      const baseTransaction = {
          household_id, user_id: user.id, category_id: categoryId,
          payment_method_id: paymentMethodId, 
          descricao, valor: valorNum, 
          data: billingDate.toISOString().split("T")[0],
          tipo: 'expense', // 4. 'tipo' está travado em 'expense'
          observacoes, is_recorrente: false,
      };

      if (showInstallments && parcelado && totalParcelas > 1) {
        // ... (Lógica de parcelamento) ...
        const parcelaValor = valorNum / totalParcelas;
        const { data: parent, error: parentError } = await supabase
          .from("transactions").insert([{ ...baseTransaction, descricao: `${descricao} (1/${totalParcelas})`, valor: parcelaValor, total_parcelas: totalParcelas, parcela_atual: 1, }])
          .select().single();
        if (parentError) throw parentError;
        let transactionsToInsert = [];
        for (let i = 1; i < totalParcelas; i++) {
          const nextDate = new Date(billingDate); nextDate.setMonth(nextDate.getMonth() + i);
          transactionsToInsert.push({ ...baseTransaction, descricao: `${descricao} (${i + 1}/${totalParcelas})`, valor: parcelaValor, data: nextDate.toISOString().split("T")[0], parcela_atual: i + 1, total_parcelas: totalParcelas, id_transacao_pai: parent.id, });
        }
        const { error: installmentError } = await supabase.from("transactions").insert(transactionsToInsert);
        if (installmentError) throw installmentError;
      } else {
        // 5. Chama o hook 'addTransaction' (que agora só adiciona despesas)
        const { error } = await addTransaction(baseTransaction);
        if (error) throw error;
      }

      // 'addTransaction' já chama o 'refresh', mas podemos garantir
      await refreshTransactions(); 
      toast({ title: "Despesa salva!", description: "Sua despesa foi registrada com sucesso." });
      onClose();

    } catch (e) {
      console.error("Erro ao salvar despesa:", e);
      toast({ title: "Erro ao salvar", description: e.message || "Não foi possível salvar a despesa.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Renderização do modal
     =============================== */
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
        >
          {/* Fundo escurecido */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className="relative z-50 w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Cabeçalho */}
            <div className="flex-shrink-0 flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <button onClick={onClose} className="text-blue-600 font-medium hover:underline">Cancelar</button>
              <h2 className="text-sm font-semibold text-gray-800">
                Nova Despesa {/* 6. Título Fixo */}
              </h2>
              <button onClick={handleSave} disabled={loading} className="text-blue-600 font-medium hover:underline disabled:text-gray-400">
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>

            {/* 7. REMOVIDO: Alternador de Tipo */}

            {/* Valor */}
            <div className="flex-shrink-0 text-center py-4 border-b border-gray-100">
              <p className="text-gray-600 text-sm mb-1">Valor da Despesa</p>
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(/[^\d,.]/g, ""))}
                placeholder="0,00"
                className="w-full text-center text-3xl font-semibold text-gray-900 outline-none bg-transparent"
              />
            </div>

            {/* Área de Rolagem */}
            <div className="flex-auto overflow-y-auto">
              <div className="flex flex-col gap-3 p-4">
                
                {/* Descrição */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                  <label className="text-xs text-gray-500 block mb-1">Descrição</label>
                  <input
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder={"Ex: Almoço, Cinema..."}
                    className="w-full bg-transparent text-sm text-gray-800 outline-none"
                  />
                </div>

                {/* Categoria (Sempre visível, apenas despesas) */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                  <div className="w-full">
                    <label className="text-xs text-gray-500 block mb-1">Categoria</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="bg-transparent text-sm text-gray-800 outline-none w-full"
                    >
                      <option value="">Escolha...</option>
                      {/* =======================================
                        // AQUI ESTÁ A CORREÇÃO
                        // Trocado de 'c.name' para 'c.nome'
                        // ======================================= */}
                      {expenseCategories.map((c) => (
                        <option key={c.id} value={c.id}> {c.nome} </option>
                      ))}
                    </select>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                </div>

                {/* Data */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Data da Compa</label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="bg-transparent text-sm text-gray-800 outline-none"
                    />
                  </div>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Método de Pagamento */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                  <div className="w-full">
                    <label className="text-xs text-gray-500 block mb-1">Pagar com</label>
                    <select
                      value={paymentMethodId}
                      onChange={(e) => setPaymentMethodId(e.target.value)}
                      className="bg-transparent text-sm text-gray-800 outline-none w-full"
                    >
                      <option value="">Selecione...</option>
                      {paymentMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome_conta} {/* (Ex: "Cartão Nubank") */}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CreditCard className="w-4 h-4 text-gray-400 ml-2" />
                </div>
                
                {/* Parcelamento */}
                {showInstallments && (
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-500 flex items-center gap-2">Parcelar compra</label>
                      <input
                        type="checkbox"
                        checked={parcelado}
                        onChange={(e) => setParcelado(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                    </div>
                    {parcelado && (
                      <div className="mt-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-500" />
                        <input
                          type="number"
                          min="2" max="24" value={totalParcelas}
                          onChange={(e) => setTotalParcelas(Number(e.target.value))}
                          className="w-20 p-1 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-300"
                        />
                        <span className="text-xs text-gray-500">parcelas</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Observações */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                  <label className="text-xs text-gray-500 block mb-1">Observações</label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Adicione detalhes..."
                    rows="2"
                    className="w-full bg-transparent text-sm text-gray-800 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex-shrink-0 px-4 pb-6 pt-4 border-t border-gray-100">
              <button onClick={handleSave} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md transition disabled:opacity-50">
                {loading ? "Salvando..." : "Salvar Despesa"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;