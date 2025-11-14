import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext'; 
import { useToast } from '../components/ui/use-Toast';
import { usePaymentMethods } from '../hooks/usePaymentMethods';

// Importa os catálogos
import { CARD_PRODUCTS, getProductsByIssuer } from '../lib/card_products';

// Importa o novo seletor visual
import CardProductSelector from './CardProductSelector'; 

// Componentes da UI
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

/**
 * Este é o modal para ADICIONAR UM NOVO CARTÃO (Método de Pagamento)
 * a uma conta que já existe.
 * * Props:
 * - isOpen: (boolean) Controla se o modal está aberto.
 * - onClose: (function) Chamada para fechar o modal.
 * - accountId: (string) O UUID da conta pai (ex: "Conta Itaú").
 * - issuerId: (string) O ID do emissor (ex: "itau_unibanco") para filtrar os produtos.
 * - defaultProductId: (string|null) O ID do "ghost card" que foi clicado (para pré-seleção).
 */
const AddPaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  accountId, 
  issuerId, 
  defaultProductId = null 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  // Carrega os métodos da conta para poder atualizá-los
  const { addPaymentMethod, refreshMethods } = usePaymentMethods(accountId);

  // Estado do formulário
  const [card_product_id, setCardProductId] = useState(''); // O produto (ex: 'nubank_uv')
  const [nome_conta, setNomeConta] = useState(''); // O apelido (ex: "Meu Cartão Pessoal")
  const [ultimos_4_digitos, setUltimos4Digitos] = useState('');
  const [close_day, setCloseDay] = useState('');
  const [loading, setLoading] = useState(false);

  // Efeito de Reset: Define o estado inicial quando o modal abre
  useEffect(() => {
    if (isOpen) {
      // Busca os produtos disponíveis para este banco
      const availableProducts = getProductsByIssuer(issuerId);
      
      // Define o produto inicial:
      // 1. Usa o 'defaultProductId' (o "ghost card" que você clicou)
      // 2. Se não houver, usa o PRIMEIRO produto da lista do banco
      // 3. Se não houver, fica vazio
      const initialProductId = defaultProductId || availableProducts[0]?.id || '';
      
      setCardProductId(initialProductId);
      
      // Reseta o resto do formulário
      setNomeConta('');
      setUltimos4Digitos('');
      setCloseDay('');
      setLoading(false);
    }
  }, [isOpen, defaultProductId, issuerId]); // Roda sempre que o modal abre

  // Função de salvar
  const handleSave = async () => {
    if (!nome_conta || !card_product_id || !close_day || !ultimos_4_digitos) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o apelido, 4 dígitos, dia de fechamento e selecione um produto.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Busca os detalhes do produto (bandeira, etc)
      const product = CARD_PRODUCTS.find(p => p.id === card_product_id);

      const dataToInsert = {
        account_id: accountId,
        issuer_id: issuerId,
        card_product_id: card_product_id,
        nome_conta: nome_conta,
        tipo: 'credit_card', // Este modal só cria cartões de crédito
        bandeira: product?.bandeira?.nome || 'Outra',
        ultimos_4_digitos: ultimos_4_digitos,
        close_day: parseInt(close_day, 10),
      };

      // Chama o hook que já temos
      const { error } = await addPaymentMethod(dataToInsert);
      if (error) throw error;

      toast({ title: "Cartão salvo!", description: "Seu novo cartão foi adicionado." });
      await refreshMethods(); // Atualiza o carrossel na página de detalhes
      onClose();

    } catch (e) {
      console.error("Erro ao salvar método:", e);
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open onOpenChange={onClose}>
          {/* NOTA: Se o modal estiver com cores escuras, o problema está
            nos seus arquivos 'tailwind.config.js' (falta 'darkMode: "class"')
            e 'index.html' (falta 'class="light"').
          */}
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl">Adicionar Novo Cartão</DialogTitle>
                <DialogDescription>
                  Selecione o produto de cartão que você deseja adicionar.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col">
              
                {/* --- 1. O SELETOR VISUAL (CARROSSEL) --- */}
                <div className="py-4">
                  <CardProductSelector
                    issuerId={issuerId}
                    value={card_product_id}
                    onChange={setCardProductId}
                  />
                </div>
                
                {/* --- 2. O FORMULÁRIO RESTANTE --- */}
                <div className="p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_conta">Apelido do Cartão</Label>
                    <Input
                      id="nome_conta"
                      value={nome_conta}
                      onChange={(e) => setNomeConta(e.target.value)}
                      placeholder="Ex: Cartão Pessoal, Cartão da Viagem"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last4">Últimos 4 Dígitos</Label>
                      <Input
                        id="last4"
                        value={ultimos_4_digitos}
                        onChange={(e) => setUltimos4Digitos(e.target.value)}
                        placeholder="1234"
                        maxLength={4}
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="close_day">Dia do Fechamento</Label>
                      <Input
                        id="close_day"
                        type="number"
                        min="1" max="31"
                        value={close_day}
                        onChange={(e) => setCloseDay(e.target.value)}
                        placeholder="Ex: 20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- 3. BOTÕES DE AÇÃO --- */}
              <DialogFooter className="p-6 pt-4 border-t border-gray-100">
                <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Cartão"}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default AddPaymentMethodModal;