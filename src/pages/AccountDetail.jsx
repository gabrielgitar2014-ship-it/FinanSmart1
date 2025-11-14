// UPDATED AccountDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertTriangle, Landmark } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAccount } from '../hooks/useAccount';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import WalletCardSelector from '../components/WalletCardSelector';
import AddPaymentMethodModal from '../components/AddPaymentMethodModal';
import { ISSUERS } from '../lib/issuers';

const AccountDetail = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({ isOpen: false, defaultProductId: null });
  const [index, setIndex] = useState(0);

  const { account, loading: loadingAccount } = useAccount(accountId);
  const { methods, loading: loadingMethods } = usePaymentMethods(accountId);

  const isLoading = loadingAccount || loadingMethods;
  const issuer = account ? ISSUERS[account.issuer_id] : null;

  const handleOpenAddModal = (productId = null) => {
    setModalState({ isOpen: true, defaultProductId: productId });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, defaultProductId: null });
  };

  if (!isLoading && !account) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Conta não encontrada</h2>
        <p className="text-gray-600">Não foi possível carregar esta conta.</p>
        <Button onClick={() => navigate('/accounts')} className="mt-6">
          Voltar para Contas
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{account ? account.nome : 'Carregando...'} - FinanceApp</title>
      </Helmet>

      <AddPaymentMethodModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        accountId={accountId}
        issuerId={account?.issuer_id}
        defaultProductId={modalState.defaultProductId}
      />

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/accounts')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Contas
          </Button>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse" />
            ) : issuer ? (
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-200/80 p-2 flex items-center justify-center">
                <img src={issuer.logo} alt={issuer.nome} className="w-10 h-10 object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-200/80 p-2 flex items-center justify-center">
                <Landmark className="w-10 h-10 text-gray-400" />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-slate-900">{account?.nome}</h1>
              <p className="text-gray-600 capitalize">{account?.tipo}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <WalletCardSelector
              issuerId={account?.issuer_id}
              existingMethods={methods}
              onAddMethodClick={handleOpenAddModal}
              index={index}
              setIndex={setIndex}
            />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AccountDetail;