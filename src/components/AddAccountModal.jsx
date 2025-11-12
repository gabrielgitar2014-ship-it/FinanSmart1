import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { useAccounts } from '../hooks/useAccounts'; 
import { useToast } from './ui/use-Toast';
// 1. IMPORTANDO O NOVO COMPONENTE
import BankAccountSelection from './BankAccountSelection'; 

const AddAccountModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'checking', 
    cor_personalizada: '#64748b',
    issuer_id: '',
    saldo_inicial: 0,
  });

  const { addAccount } = useAccounts(); 
  const { toast } = useToast();

  // Quando um banco é selecionado no componente
  const handleBankSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      nome: template.nome,
      issuer_id: template.issuer_id,
      cor_personalizada: template.color,
      tipo: 'checking', 
      saldo_inicial: 0,
    }));
    setStep(2); // Avança para o formulário
  };

  // Quando "Personalizar" é clicado
  const handlePersonalizar = () => {
    handleBankSelect({
      issuer_id: "outro",
      nome: "Conta Personalizada",
      color: "#64748b", // Cinza padrão
    });
  };

  // Reseta o modal ao fechar
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedTemplate(null);
      setFormData({
        nome: '', tipo: 'checking', cor_personalizada: '#64748b', issuer_id: '', saldo_inicial: 0,
      });
    }, 300); 
  };

  // Envia para a tabela 'accounts'
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await addAccount(formData); 
    
    if (error) {
      toast({
        title: "Erro ao adicionar conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta adicionada!",
        description: "A nova conta foi criada com sucesso.",
      });
      handleClose();
    }
  };

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
            {/* Header do Modal */}
            <div className="flex justify-between items-center p-4 border-b">
              {step === 2 && (
                <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h2 className="text-lg font-semibold text-slate-900 ml-2">
                {step === 1 ? 'Selecione a Instituição' : 'Detalhes da Conta'}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                
                {/* --- ETAPA 1: Renderiza o novo componente --- */}
                {step === 1 && (
                  <BankAccountSelection 
                    onBankSelect={handleBankSelect}
                    onCustomize={handlePersonalizar}
                  />
                )}
                
                {/* --- ETAPA 2: Formulário de Detalhes (sem mudança) --- */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Nome da Conta */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome da Conta
                        </label>
                        <Input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Ex: Conta Principal"
                          required
                        />
                      </div>
                      
                      {/* Tipo da Conta */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
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

                      {/* Saldo Inicial */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Saldo Inicial
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.saldo_inicial}
                          onChange={(e) => setFormData({ ...formData, saldo_inicial: parseFloat(e.target.value) || 0 })}
                          placeholder="0,00"
                          required
                        />
                      </div>

                      {/* Cor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cor de Destaque
                        </label>
                        <Input
                          type="color"
                          value={formData.cor_personalizada}
                          onChange={(e) => setFormData({ ...formData, cor_personalizada: e.target.value })}
                          className="w-full h-10"
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          Salvar Conta
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