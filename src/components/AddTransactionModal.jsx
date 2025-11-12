import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, ChevronRight, Layers } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; 
import { useTransactions } from '../hooks/useTransactions'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useToast } from '../components/ui/use-Toast';

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
// O COMPONENTE PRINCIPAL DO MODAL
// ===================================================================
const AddTransactionModal = ({ isOpen, onClose, accounts, categories }) => {
  const { refreshTransactions } = useTransactions();
  const { user, activeHousehold } = useAuth();
  const { toast } = useToast();

  const [tipo, setTipo] = useState('expense');
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState(2); 
  const [loading, setLoading] = useState(false);

  const isIncome = tipo === 'income';

  const selectedAccount = accounts?.find((a) => a.id === accountId);
  const isCredit = selectedAccount?.type === "credit_card";
  const showInstallments = tipo === 'expense' && isCredit;
  
  // Filtra categorias para mostrar apenas as de DESPESA
  const expenseCategories = categories.filter(c => c.tipo === 'expense');

  // MUDANÇA: Encontra a categoria de Receita padrão
  const incomeCategory = categories.find(c => c.tipo === 'income' && (c.nome === 'Receita' || c.nome === 'Rendimentos'));
  const DEFAULT_INCOME_CATEGORY_ID = incomeCategory?.id;

  // Efeito de Reset (Atualizado)
  useEffect(() => {
    if (isOpen) {
      setTipo('expense');
      setDescricao('');
      setValor('');
      setData(new Date().toISOString().split('T')[0]);
      setAccountId(accounts[0]?.id || '');
      setCategoryId(expenseCategories[0]?.id || '');
      setObservacoes('');
      setParcelado(false);
      setTotalParcelas(2);
      setLoading(false);
    }
  }, [isOpen, accounts]);

  // MUDANÇA: Efeito para lidar com a troca de TIPO
  useEffect(() => {
    if (isIncome) {
      // Se for RECEITA, trava a categoria no ID padrão
      // (Mantém o seletor de conta!)
      setCategoryId(DEFAULT_INCOME_CATEGORY_ID || '');
      setAccountId(accounts[0]?.id || ''); // Pré-seleciona a primeira conta
      setParcelado(false); // Desativa parcelamento
    } else {
      // Se for DESPESA, volta ao comportamento padrão
      setAccountId(accounts[0]?.id || '');
      setCategoryId(expenseCategories[0]?.id || '');
    }
  }, [tipo, accounts, categories, DEFAULT_INCOME_CATEGORY_ID]);


  // Função handleSave (sem mudanças)
  const handleSave = async () => {
    if (!descricao || !valor || !accountId || (isIncome && !DEFAULT_INCOME_CATEGORY_ID) || (!isIncome && !categoryId) ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      // Verifica se o erro é a categoria de receita faltando
      if (isIncome && !DEFAULT_INCOME_CATEGORY_ID) {
         toast({
          title: "Erro de Configuração",
          description: "A categoria 'Receita' padrão não foi encontrada. Contate o suporte.",
          variant: "destructive"
        });
      }
      return;
    }
    
    // MUDANÇA: Garante que o ID da categoria correto está sendo usado
    const finalCategoryId = isIncome ? DEFAULT_INCOME_CATEGORY_ID : categoryId;
    
    try {
      setLoading(true);
      if (!user || !activeHousehold?.id) throw new Error("Usuário ou Família não autenticados.");

      let billingDate = parseLocalDate(data);
      if (isCredit && selectedAccount?.close_day) {
        billingDate = getBillingMonth(data, selectedAccount.close_day);
      }
      const valorNum = parseFloat(valor.replace(",", "."));
      const household_id = activeHousehold.id;

      if (showInstallments && parcelado && totalParcelas > 1) {
        // ... (lógica de parcelamento) ...
        const parcelaValor = valorNum / totalParcelas;
        const { data: parent, error: parentError } = await supabase.from("transactions").insert([{
          household_id, user_id: user.id, account_id: accountId, category_id: finalCategoryId,
          descricao: `${descricao} (1/${totalParcelas})`, valor: parcelaValor,
          data: billingDate.toISOString().split("T")[0], tipo, total_parcelas: totalParcelas,
          parcela_atual: 1, observacoes, is_recorrente: false,
        }]).select().single();
        if (parentError) throw parentError;
        let transactionsToInsert = [];
        for (let i = 1; i < totalParcelas; i++) {
          const nextDate = new Date(billingDate);
          nextDate.setMonth(nextDate.getMonth() + i);
          transactionsToInsert.push({
            household_id, user_id: user.id, account_id: accountId, category_id: finalCategoryId,
            descricao: `${descricao} (${i + 1}/${totalParcelas})`, valor: parcelaValor,
            data: nextDate.toISOString().split("T")[0], tipo, parcela_atual: i + 1,
            total_parcelas: totalParcelas, id_transacao_pai: parent.id, observacoes, is_recorrente: false,
          });
        }
        const { error: installmentError } = await supabase.from("transactions").insert(transactionsToInsert);
        if (installmentError) throw installmentError;
      } else {
        const { error } = await supabase.from("transactions").insert({
          household_id, user_id: user.id, account_id: accountId, category_id: finalCategoryId,
          descricao, valor: valorNum, data: billingDate.toISOString().split("T")[0],
          tipo, observacoes, is_recorrente: false,
        });
        if (error) throw error;
      }
      await refreshTransactions(); 
      toast({ title: "Transação salva!", description: "Sua transação foi registrada com sucesso." });
      onClose();
    } catch (e) {
      console.error("Erro ao salvar transação:", e);
      toast({ title: "Erro ao salvar", description: e.message || "Não foi possível salvar a transação.", variant: "destructive" });
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className="relative z-50 w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Cabeçalho */}
            <div className="flex-shrink-0 flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <button onClick={onClose} className="text-blue-600 font-medium hover:underline">
                Cancelar
              </button>
              <h2 className="text-sm font-semibold text-gray-800">
                Nova {isIncome ? "Receita" : "Despesa"}
              </h2>
              <button onClick={handleSave} disabled={loading} className="text-blue-600 font-medium hover:underline disabled:text-gray-400">
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>

            {/* Alternador de Tipo */}
            <div className="flex-shrink-0 p-2">
              <div className="flex w-full bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTipo('expense')}
                  className={`w-1/2 py-1.5 rounded-md text-sm font-medium transition-all ${
                    tipo === 'expense' ? 'bg-white shadow' : 'text-gray-600'
                  }`}
                >
                  Despesa
                </button>
                <button
                  onClick={() => setTipo('income')}
                  className={`w-1/2 py-1.5 rounded-md text-sm font-medium transition-all ${
                    tipo === 'income' ? 'bg-white shadow' : 'text-gray-600'
                  }`}
                >
                  Receita
                </button>
              </div>
            </div>

            {/* Valor */}
            <div className="flex-shrink-0 text-center py-4 border-b border-gray-100">
              <p className="text-gray-600 text-sm mb-1">Valor</p>
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value.replace(/[^\d,.]/g, "")) 
                }
                placeholder="0,00"
                className="w-full text-center text-3xl font-semibold text-gray-900 outline-none bg-transparent"
              />
            </div>

            {/* Área de Rolagem */}
            <div className="flex-auto overflow-y-auto">
              <div className="flex flex-col gap-3 p-4">
                
                {/* Descrição */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                  <label className="text-xs text-gray-500 block mb-1">
                    Descrição
                  </label>
                  <input
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder={isIncome ? "Ex: Salário, Freelance..." : "Ex: Almoço, Cinema..."}
                    className="w-full bg-transparent text-sm text-gray-800 outline-none"
                  />
                </div>

                {/* MUDANÇA: Campo de Categoria agora é condicional */}
                {!isIncome && (
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                    <div className="w-full">
                      <label className="text-xs text-gray-500 block mb-1">
                        Categoria
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="bg-transparent text-sm text-gray-800 outline-none w-full"
                      >
                        <option value="">Escolha...</option>
                        {expenseCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} 
                          </option>
                        ))}
                      </select>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                  </div>
                )}

                {/* Data */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      {isIncome ? "Data de Recebimento" : "Data da Compra"}
                    </label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="bg-transparent text-sm text-gray-800 outline-none"
                    />
                  </div>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Conta (Forma de pagamento) 
                    (Este campo agora é mostrado para AMBOS os tipos) */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                  <div className="w-full">
                    <label className="text-xs text-gray-500 block mb-1">
                      {isIncome ? "Depositar em" : "Pagar com"}
                    </label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="bg-transparent text-sm text-gray-800 outline-none w-full"
                    >
                      <option value="">Selecione</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CreditCard className="w-4 h-4 text-gray-400 ml-2" />
                </div>
                
                {/* Parcelamento (apenas para despesas de cartão) */}
                {showInstallments && (
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-500 flex items-center gap-2">
                        Parcelar compra
                      </label>
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
                          min="2"
                          max="24"
                          value={totalParcelas}
                          onChange={(e) =>
                            setTotalParcelas(Number(e.target.value))
                          }
                          className="w-20 p-1 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-300"
                        />
                        <span className="text-xs text-gray-500">
                          parcelas mensais
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Observações */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                  <label className="text-xs text-gray-500 block mb-1">
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Adicione detalhes, lembretes ou notas..."
                    rows="2"
                    className="w-full bg-transparent text-sm text-gray-800 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Botão principal de Salvar (Footer Fixo) */}
            <div className="flex-shrink-0 px-4 pb-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Transação"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;