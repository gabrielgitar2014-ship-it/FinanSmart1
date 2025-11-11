import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { useAccounts } from '../hooks/useAccounts';
import { useToast } from '../components/ui/use-Toast';

const AddAccountModal = ({ isOpen, onClose, editingAccount }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
  });

  const { addAccount, updateAccount } = useAccounts();
  const { toast } = useToast();

  useEffect(() => {
    if (editingAccount) {
      setFormData({
        name: editingAccount.name,
        type: editingAccount.type,
      });
    } else {
      setFormData({
        name: '',
        type: 'checking',
      });
    }
  }, [editingAccount, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingAccount) {
      const { error } = await updateAccount(editingAccount.id, formData);
      if (error) {
        toast({
          title: "Erro ao atualizar conta",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta atualizada!",
          description: "A conta foi atualizada com sucesso.",
        });
        onClose();
      }
    } else {
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
          description: "A conta foi criada com sucesso.",
        });
        onClose();
      }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Conta
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Nubank"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {editingAccount ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddAccountModal;