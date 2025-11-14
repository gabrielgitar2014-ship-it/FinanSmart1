import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { useAccounts } from '../hooks/useAccounts'; 
import { useToast } from './ui/use-Toast';
import BankAccountSelection from './BankAccountSelection'; 

import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ISSUERS } from '../lib/issuers'; // Usado apenas para o 'generic'

const AddAccountModal = ({ isOpen, onClose, accountToEdit = null }) => {
  
  const isEditMode = Boolean(accountToEdit);
  const [step, setStep] = useState(isEditMode ? 2 : 1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'checking', 
    cor_personalizada: '#64748b',
    issuer_id: '',
    saldo_inicial: 0,
  });

  const { refreshAccounts, updateAccount } = useAccounts(); 
  const { user, activeHousehold } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && accountToEdit) {
        setFormData({
          nome: accountToEdit.nome || '',
          tipo: accountToEdit.tipo || 'checking',
          cor_personalizada: accountToEdit.cor_personalizada || '#64748b',
          issuer_id: accountToEdit.issuer_id || 'generic',
          saldo_inicial: accountToEdit.saldo_inicial || 0,
        });
        setStep(2);
      } else {
        setStep(1);
        setSelectedTemplate(null);
        setFormData({
          nome: '', tipo: 'checking', cor_personalizada: '#64748b', issuer_id: '', saldo_inicial: 0,
        });
      }
    }
  }, [isOpen, isEditMode, accountToEdit]);


  // ===================================================
  // A CORREÇÃO ESTÁ AQUI:
  // Trocado 'bank.id' para 'bank.issuer_id'
  // ===================================================
  const handleBankSelect = (bank) => {
    setSelectedTemplate(bank);
    setFormData(prev => ({
      ...prev,
      nome: bank.nome,
      issuer_id: bank.issuer_id, // <-- CORRIGIDO (era bank.id)
      cor_personalizada: bank.cor || '#64748b', // Pega a cor ou usa um padrão
      tipo: 'checking', 
      saldo_inicial: 0,
    }));
    setStep(2);
  };

  const handlePersonalizar = () => {
    // A função de personalizar estava errada, vamos corrigir também.
    // Ela deve usar 'issuer_id' para ser consistente.
    handleBankSelect({
      issuer_id: "generic",
      nome: "Conta Personalizada",
      cor: ISSUERS['generic'].cor,
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedTemplate(null);
      setFormData({
        nome: '', tipo: 'checking', cor_personalizada: '#64748b', issuer_id: '', saldo_inicial: 0,
      });
      setLoading(false);
    }, 300); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isEditMode) {
      const { saldo_inicial, ...dataToUpdate } = formData;
      const { error } = await updateAccount(accountToEdit.id, dataToUpdate);
      if (error) {
        toast({ title: "Erro ao atualizar conta", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Conta atualizada!", description: "Os dados da conta foram salvos." });
        handleClose();
      }
    } else {
      if (!user || !activeHousehold?.id) {
        toast({ title: "Erro de autenticação", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      const saldoNum = parseFloat(formData.saldo_inicial.toString().replace(",", ".") || 0);
      
      // O nome do banco (do template selecionado)
      const issuerNome = selectedTemplate?.nome || 'Conta';
      
      const defaultPaymentMethodName = (formData.issuer_id === 'generic' || formData.tipo === 'cash')
        ? formData.nome : `Depósito/Pix - ${issuerNome}`;

      const rpcParams = {
        p_household_id: activeHousehold.id,
        p_user_id: user.id,
        p_nome: formData.nome,
        p_tipo: formData.tipo,
        p_saldo_inicial: saldoNum,
        p_issuer_id: formData.issuer_id, // <-- Agora terá o valor correto ("itau", "nubank", etc)
        p_default_payment_method_name: defaultPaymentMethodName
      };

      console.log("[AddAccountModal] 🚀 Chamando NOVA RPC: fn_create_account", rpcParams);

      try {
        const { error } = await supabase.rpc('fn_create_account', rpcParams);

        if (error) throw error; 

        toast({ title: "Conta criada!", description: "Sua nova conta foi registrada com sucesso." });
        await refreshAccounts();
        handleClose();

      } catch (error) {
        console.error("[AddAccountModal] ❌ Erro na RPC:", error);
        toast({ 
          title: "Erro ao adicionar conta", 
          description: error.message || "Não foi possível chamar a função no banco.", 
          variant: "destructive" 
        });
      }
    }
    setLoading(false);
  };

  // --- Renderização (sem mudanças) ---
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b">
              {(step === 2 && !isEditMode) ? (
                <Button variant="ghost" size="icon" onClick={() => setStep(1)} disabled={loading}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              ) : (
                <div className="w-9 h-9" />
              )}
              
              <h2 className="text-lg font-semibold text-slate-900 text-center">
                {isEditMode ? 'Editar Conta' : (step === 1 ? 'Selecione a Instituição' : 'Detalhes da Conta')}
              </h2>

              <Button variant="ghost" size="icon" onClick={handleClose} disabled={loading}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                
                {step === 1 && (
                  <BankAccountSelection 
                    onBankSelect={handleBankSelect}
                    onCustomize={handlePersonalizar}
                  />
                )}
                
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome da Conta
                        </Label>
                        <Input
                          id="nome"
                          type="text"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Ex: Conta Principal"
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                          disabled={loading}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Conta Corrente / Digital</SelectItem>
                            <SelectItem value="savings">Poupança</SelectItem>
                            <SelectItem value="investment">Investimento</SelectItem>
                            <SelectItem value="cash">Dinheiro (Caixa Pessoal)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="saldo_inicial" className="block text-sm font-medium text-gray-700 mb-1">
                          Saldo Inicial (R$)
                        </Label>
                        <Input
                          id="saldo_inicial"
                          type="text"
                          inputMode="decimal"
                          value={formData.saldo_inicial}
                          onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value.replace(/[^\d,.]/g, "") })}
                          placeholder="0,00"
                          required
                          disabled={loading || isEditMode} 
                          title={isEditMode ? "O saldo inicial não pode ser editado após a criação." : ""}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cor" className="block text-sm font-medium text-gray-700 mb-1">
                          Cor de Destaque
                        </Label>
                        <Input
                          id="cor"
                          type="color"
                          value={formData.cor_personalizada}
                          onChange={(e) => setFormData({ ...formData, cor_personalizada: e.target.value })}
                          className="w-full h-10"
                          disabled={loading}
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          className="flex-1"
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                          disabled={loading}
                        >
                          {loading ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar Conta")}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddAccountModal;