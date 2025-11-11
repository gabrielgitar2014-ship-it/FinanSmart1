import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Wallet, Banknote, Edit2, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAccounts } from '../hooks/useAccounts';
import { useToast } from '../components/ui/use-toast';
import AddAccountModal from '../components/AddAccountModal';

const Accounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const { accounts, deleteAccount } = useAccounts();
  const { toast } = useToast();

  const getAccountIcon = (type) => {
    switch (type) {
      case 'credit_card':
        return CreditCard;
      case 'checking':
        return Wallet;
      case 'cash':
        return Banknote;
      default:
        return Wallet;
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'checking':
        return 'Conta Corrente';
      case 'cash':
        return 'Dinheiro';
      default:
        return type;
    }
  };

  const handleDelete = async (id) => {
    const { error } = await deleteAccount(id);
    if (error) {
      toast({
        title: "Erro ao excluir conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta excluída!",
        description: "A conta foi removida com sucesso.",
      });
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Contas - Gerenciador Financeiro</title>
        <meta name="description" content="Gerencie suas contas bancárias e cartões" />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Contas</h1>
            <p className="text-gray-400 mt-1">Gerencie suas contas e cartões</p>
          </div>
          <Button
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account, index) => {
            const Icon = getAccountIcon(account.type);
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getAccountTypeLabel(account.type)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {accounts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhuma conta cadastrada
            </h3>
            <p className="text-gray-500">
              Comece adicionando sua primeira conta
            </p>
          </motion.div>
        )}

        <AddAccountModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAccount(null);
          }}
          editingAccount={editingAccount}
        />
      </div>
    </>
  );
};

export default Accounts;