// UPDATED WalletCardSelector.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Plus, Landmark } from 'lucide-react';
import { ISSUERS } from '../lib/issuers';
import { CARD_PRODUCTS, Bandeiras, getProductsByIssuer } from '../lib/card_products';

function shade(hex, percent) {
  if (!hex) return '#AAAAAA';
  const _hex = hex.replace('#', '');
  const num = parseInt(_hex, 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00ff) + percent;
  const b = (num & 0x0000ff) + percent;
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return (
    '#' +
    clamp(r).toString(16).padStart(2, '0') +
    clamp(g).toString(16).padStart(2, '0') +
    clamp(b).toString(16).padStart(2, '0')
  );
}

const Chip = () => (
  <div className="w-10 h-7 rounded-sm overflow-hidden">
    <img src="/icons/chip.png" alt="Chip" className="w-full h-full object-cover" />
  </div>
);

const Card = ({ method, product, issuer, isGhost, onClick }) => {
  const color = issuer.cor || '#4B5563';
  const displayName = isGhost ? product.nome : method.nome_conta;
  const productName = isGhost ? product.tier : product?.nome;
  const last4 = isGhost ? '••••' : method.ultimos_4_digitos;
  const logoBandeira = product?.bandeira?.logo || null;

  return (
    <motion.div
      role="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      className={`relative w-[300px] md:w-[320px] h-[180px] md:h-[200px] rounded-3xl text-white shadow-2xl select-none shrink-0 ${isGhost ? 'opacity-70' : ''}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${color}, ${shade(color, -25)})` }}
      layout
    >
      {isGhost && (
        <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-white/50 flex flex-col items-center justify-center bg-black/10">
          <Plus className="w-10 h-10 mb-2" />
          <span className="font-semibold">Adicionar Cartão</span>
        </div>
      )}

      {!isGhost && (
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">{displayName}</span>
            <img src={issuer.logo} className="w-8 h-8 bg-white/20 rounded-full p-1" />
          </div>

          <div className="flex flex-col gap-4">
            <Chip />

            <div className="flex items-center gap-2 tracking-widest text-lg font-mono">
              <span>•••• •••• ••••</span>
              <span className="font-semibold">{last4}</span>
            </div>

            <div className="flex items-end justify-between">
              <div className="text-sm opacity-90">
                <div className="text-white/80 text-[10px] uppercase tracking-wider">Apelido</div>
                <div className="font-semibold">{productName}</div>
              </div>
              {logoBandeira && <img src={logoBandeira} className="h-6 object-contain" />}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const WalletCardSelector = ({ issuerId, existingMethods, onAddMethodClick }) => {
  const issuer = ISSUERS[issuerId] || ISSUERS.generic;

  const allCards = useMemo(() => {
    const potentialProducts = getProductsByIssuer(issuerId);

    const existingCards = existingMethods.map((method) => ({
      isGhost: false,
      method,
      product: CARD_PRODUCTS.find((p) => p.id === method.card_product_id),
      id: method.id,
    }));

    const ghostCards = potentialProducts
      .filter((product) => !existingMethods.some((m) => m.card_product_id === product.id))
      .map((product) => ({ isGhost: true, method: null, product, id: product.id }));

    return [...existingCards, ...ghostCards];
  }, [issuerId, existingMethods]);

  return (
    <div className="w-full py-6">
      <div className="flex space-x-4 overflow-x-auto p-4 snap-x snap-mandatory">
        {allCards.map((card) => (
          <div key={card.id} className="snap-center">
            <Card
              method={card.method}
              product={card.product}
              issuer={issuer}
              isGhost={card.isGhost}
              onClick={() => card.isGhost && onAddMethodClick(card.product.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletCardSelector;