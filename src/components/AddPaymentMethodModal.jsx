import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { usePaymentMethods } from '../hooks/usePaymentMethods'; // O hook que acabamos de criar
import { useToast } from './ui/use-Toast';

const AddPaymentMethodModal = ({ isOpen, onClose, accountId }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'credit_card', // 'credit_card', 'debit_card', 'pix'
    bandeira: 'Visa',
    ultimos_4_digitos: '',
    close_day: '',
    cor_personalizada: '#64748b',
    issuer_id: '',
  });

  const { addPaymentMethod } = usePaymentMethods();
  const { toast } = useToast();

  const handleClose = () => {
    onClose();
    // Reseta o formulário
    setFormData({
      nome: '', tipo: 'credit_card', bandeira: 'Visa', ultimos_4_digitos: '',
      close_day: '', cor_personalizada: '#64748b', issuer_id: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      toast({ title: "Erro", description: "ID da Conta não encontrado.", variant: "destructive" });
      return;
    }

    const { error } = await addPaymentMethod({
      ...formData,
      account_id: accountId, // Associa este método à conta pai
    });

    if (error) {
      toast({
        title: "Erro ao adicionar método",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Método de Pagamento adicionado!",
        description: "O novo método foi criado com sucesso.",
      });
      handleClose();
    }
  };

  const isCreditCard = formData.tipo === 'credit_card';

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">Novo Método de Pagamento</h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
              {/* Nome do Método */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome (Apelido)
                </label>
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Cartão Black, Pix, Débito"
                  required
                />
              </div>

              {/* Tipo do Método */}
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
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campos Condicionais para Cartão de Crédito */}
              <AnimatePresence>
                {isCreditCard && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bandeira</label>
                      <Select
                        value={formData.bandeira}
                        onValueChange={(value) => setFormData({ ...formData, bandeira: value })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="Mastercard">Mastercard</SelectItem>
                          <SelectItem value="Elo">Elo</SelectItem>
                          <SelectItem value="Amex">American Express</SelectItem>
                          <SelectItem value="Hipercard">Hipercard</SelectItem>
                          <SelectItem value="Outra">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 4 dígitos</label>
                      <Input
                        type="text"
                        maxLength="4"
                        value={formData.ultimos_4_digitos}
                        onChange={(e) => setFormData({ ...formData, ultimos_4_digitos: e.target.value })}
                        placeholder="1234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dia do Fechamento da Fatura</label>
                      <Input
                        type="number" min="1" max="31"
                        value={formData.close_day}
                        onChange={(e) => setFormData({ ...formData, close_day: e.target.value })}
                        placeholder="Ex: 25"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Cartão</label>
                      <Input
                        type="color"
                        value={formData.cor_personalizada}
                        onChange={(e) => setFormData({ ...formData, cor_personalizada: e.target.value })}
                        className="w-full h-10"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
                  Salvar Método
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPaymentMethodModal;