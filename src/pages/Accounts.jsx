// UPDATED Accounts.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Landmark, PiggyBank, Wallet, MoreVertical, Edit, Trash2, Banknote } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { Card } from '../components/ui/Card';
import { Button, buttonVariants } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-Toast';
import AddAccountModal from '../components/AddAccountModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../components/ui/DropdownMenu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/AlertDialog';

import { ISSUERS } from '../lib/issuers';

const AccountListItem = ({ account, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const issuer = account.issuer_id ? ISSUERS[account.issuer_id] : null;

  const saldoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(account.saldo_inicial || 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/75 backdrop-blur-lg border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 flex items-center justify-between">
          <div
            className="flex-1 flex items-center gap-4 cursor-pointer"
            onClick={() => navigate(`/accounts/${account.id}`)}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: issuer?.cor || '#e5e7eb' }}
            >
              {issuer ? (
                <img src={issuer.logo} alt={issuer.nome} className="w-8 h-8 object-contain" />
              ) : (
                <Landmark className="w-6 h-6 text-slate-700" />
              )}
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900">{account.nome}</p>
              <p className="text-sm text-slate-600 capitalize">{account.tipo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right cursor-pointer" onClick={() => navigate(`/accounts/${account.id}`)}>
              <p className="text-xl font-bold text-slate-800">{saldoFormatado}</p>
              <p className="text-xs text-slate-500">Saldo atual</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(account)}>
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(account)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Accounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const { accounts, loading, deleteAccount } = useAccounts();
  const { toast } = useToast();

  const handleEdit = (account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setAccountToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAccountToEdit(null);
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;

    const { error } = await deleteAccount(accountToDelete.id);

    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Conta excluída!', description: `${accountToDelete.nome} foi removida.` });
    }
    setAccountToDelete(null);
  };

  return (
    <>
      <Helmet><title>Contas - FinanceApp</title></Helmet>

      <AddAccountModal isOpen={isModalOpen} onClose={handleCloseModal} accountToEdit={accountToEdit} />

      <AlertDialog open={Boolean(accountToDelete)} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente a conta <strong>{accountToDelete?.nome}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: 'destructive' })}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-8">
        <motion.div>
          <h1 className="text-3xl font-bold text-slate-900">Contas</h1>
          <p className="text-gray-600 mt-1">Onde seu dinheiro está guardado.</p>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 mt-4"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Conta
          </Button>
        </motion.div>

        {!loading && accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <AccountListItem
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onDelete={setAccountToDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Accounts;