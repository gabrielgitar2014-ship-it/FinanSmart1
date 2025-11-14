/**
 * Catálogo de Produtos de Cartão (Baseado no PDF).
 * Este arquivo define os cartões específicos que um usuário pode 
 * associar a um 'payment_method'.
 * * Cada produto está vinculado a um 'issuer_id' do arquivo 'lib/issuers.js'.
 */

// 1. Definições Padrão de Bandeiras
// Para padronizar os dados e facilitar a renderização (ex: mostrar o logo da Visa)
export const Bandeiras = {
  MASTERCARD: { id: 'mastercard', nome: 'Mastercard', logo: '/logos/bandeiras/mastercard.svg' },
  VISA: { id: 'visa', nome: 'Visa', logo: '/logos/bandeiras/visa.svg' },
  ELO: { id: 'elo', nome: 'Elo', logo: '/logos/bandeiras/elo.svg' },
  AMEX: { id: 'amex', nome: 'American Express', logo: '/logos/bandeiras/amex.svg' },
  GENERIC: { id: 'generic', nome: 'Outra', logo: '/logos/bandeiras/generic.svg' },
};

// 2. Definições Padrão de Tiers (Níveis)
// Para padronizar a UI (ex: cartões 'black' podem ter um fundo escuro)
export const Tiers = {
  STANDARD: 'Standard',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  BLACK: 'Black',
  INFINITE: 'Infinite',
  NANQUIM: 'Nanquim', // Específico do Elo
};

// 3. O Catálogo Principal de Produtos
export const CARD_PRODUCTS = [
  // --- NUBANK --- (source: 2)
  { id: 'nubank_std', issuer_id: 'nubank', nome: 'Nubank (Crédito)', bandeira: Bandeiras.MASTERCARD, tier: Tiers.STANDARD },
  { id: 'nubank_uv', issuer_id: 'nubank', nome: 'Nubank Ultravioleta', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  
  // --- ITAÚ --- (source: 5)
  { id: 'itau_std', issuer_id: 'itau_unibanco', nome: 'Itaucard (Internacional/Gold/Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'itau_latam_gold', issuer_id: 'itau_unibanco', nome: 'Itaucard Latam Pass (Gold)', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'itau_latam_plat', issuer_id: 'itau_unibanco', nome: 'Itaucard Latam Pass (Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.PLATINUM },
  { id: 'itau_latam_black', issuer_id: 'itau_unibanco', nome: 'Itaucard Latam Pass (Black)', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  { id: 'itau_latam_inf', issuer_id: 'itau_unibanco', nome: 'Itaucard Latam Pass (Infinite)', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'itau_azul_inter', issuer_id: 'itau_unibanco', nome: 'Itaucard Azul (Internacional)', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'itau_azul_gold', issuer_id: 'itau_unibanco', nome: 'Itaucard Azul (Gold)', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'itau_azul_plat', issuer_id: 'itau_unibanco', nome: 'Itaucard Azul (Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.PLATINUM },
  { id: 'itau_azul_inf', issuer_id: 'itau_unibanco', nome: 'Itaucard Azul (Infinite)', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'itau_pda_gold', issuer_id: 'itau_unibanco', nome: 'Pão de Açúcar (Gold)', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'itau_pda_plat', issuer_id: 'itau_unibanco', nome: 'Pão de Açúcar (Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.PLATINUM },
  { id: 'itau_pda_black', issuer_id: 'itau_unibanco', nome: 'Pão de Açúcar (Black)', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  { id: 'itau_personnalite', issuer_id: 'itau_unibanco', nome: 'Personnalité (Black/Infinite)', bandeira: Bandeiras.GENERIC, tier: Tiers.BLACK },
  { id: 'itau_theone', issuer_id: 'itau_unibanco', nome: 'The One (Black/Infinite)', bandeira: Bandeiras.GENERIC, tier: Tiers.BLACK },

  // --- BRADESCO --- (source: 11)
  { id: 'bradesco_std', issuer_id: 'bradesco', nome: 'Bradesco (Internacional/Gold)', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'bradesco_plat', issuer_id: 'bradesco', nome: 'Bradesco (Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.PLATINUM },
  { id: 'bradesco_black', issuer_id: 'bradesco', nome: 'Bradesco (Black)', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  { id: 'bradesco_inf', issuer_id: 'bradesco', nome: 'Bradesco (Infinite)', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'bradesco_elo_nanquim', issuer_id: 'bradesco', nome: 'Elo Nanquim', bandeira: Bandeiras.ELO, tier: Tiers.NANQUIM },
  { id: 'bradesco_aeternum', issuer_id: 'bradesco', nome: 'Aeternum Visa Infinite', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'bradesco_amex_green', issuer_id: 'bradesco', nome: 'American Express (Green)', bandeira: Bandeiras.AMEX, tier: Tiers.STANDARD },
  { id: 'bradesco_amex_gold', issuer_id: 'bradesco', nome: 'American Express (Gold)', bandeira: Bandeiras.AMEX, tier: Tiers.GOLD },
  { id: 'bradesco_amex_plat', issuer_id: 'bradesco', nome: 'American Express (Platinum)', bandeira: Bandeiras.AMEX, tier: Tiers.PLATINUM },
  { id: 'bradesco_smiles_gold', issuer_id: 'bradesco', nome: 'Smiles (Gold)', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'bradesco_smiles_plat', issuer_id: 'bradesco', nome: 'Smiles (Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.PLATINUM },
  { id: 'bradesco_smiles_inf', issuer_id: 'bradesco', nome: 'Smiles (Infinite)', bandeira: Bandeiras.GENERIC, tier: Tiers.INFINITE },

  // --- BANCO DO BRASIL --- (source: 17)
  { id: 'bb_ourocard_std', issuer_id: 'banco_do_brasil', nome: 'Ourocard (Internacional/Gold)', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'bb_ourocard_plat', issuer_id: 'banco_do_brasil', nome: 'Ourocard (Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.PLATINUM },
  { id: 'bb_ourocard_inf', issuer_id: 'banco_do_brasil', nome: 'Ourocard Visa Infinite', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'bb_altus_inf', issuer_id: 'banco_do_brasil', nome: 'Altus Visa Infinite', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  
  // --- SANTANDER --- (source: 21)
  { id: 'santander_sx', issuer_id: 'santander', nome: 'Santander SX', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'santander_free', issuer_id: 'santander', nome: 'Santander Free', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'santander_unique', issuer_id: 'santander', nome: 'Santander Unique (Infinite/Black)', bandeira: Bandeiras.GENERIC, tier: Tiers.BLACK },
  { id: 'santander_unlimited', issuer_id: 'santander', nome: 'Santander Unlimited (Infinite/Black)', bandeira: Bandeiras.GENERIC, tier: Tiers.BLACK },
  { id: 'santander_decolar', issuer_id: 'santander', nome: 'Decolar (Gold/Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'santander_decolar_inf', issuer_id: 'santander', nome: 'Decolar (Infinite/Black)', bandeira: Bandeiras.GENERIC, tier: Tiers.INFINITE },
  { id: 'santander_aadvantage', issuer_id: 'santander', nome: 'AAdvantage (Gold/Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'santander_aadvantage_black', issuer_id: 'santander', nome: 'AAdvantage (Black)', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },

  // --- CAIXA --- (source: 27)
  { id: 'caixa_sim', issuer_id: 'caixa', nome: 'Caixa Sim', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'caixa_uni', issuer_id: 'caixa', nome: 'Caixa Universitário', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'caixa_gold_plat', issuer_id: 'caixa', nome: 'Caixa (Gold/Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'caixa_inf', issuer_id: 'caixa', nome: 'Caixa Visa Infinite', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'caixa_elo_nanquim', issuer_id: 'caixa', nome: 'Caixa Elo Nanquim', bandeira: Bandeiras.ELO, tier: Tiers.NANQUIM },
  { id: 'caixa_icone', issuer_id: 'caixa', nome: 'Caixa Ícone', bandeira: Bandeiras.GENERIC, tier: Tiers.BLACK },

  // --- INTER --- (source: 32)
  { id: 'inter_gold', issuer_id: 'banco_inter', nome: 'Inter Gold', bandeira: Bandeiras.MASTERCARD, tier: Tiers.GOLD },
  { id: 'inter_plat', issuer_id: 'banco_inter', nome: 'Inter Platinum', bandeira: Bandeiras.MASTERCARD, tier: Tiers.PLATINUM },
  { id: 'inter_black', issuer_id: 'banco_inter', nome: 'Inter Black', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  { id: 'inter_win', issuer_id: 'banco_inter', nome: 'Inter Win', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },

  // --- C6 BANK --- (source: 37)
  { id: 'c6_std', issuer_id: 'c6_bank', nome: 'C6 (básico)', bandeira: Bandeiras.MASTERCARD, tier: Tiers.STANDARD },
  { id: 'c6_plat', issuer_id: 'c6_bank', nome: 'C6 Platinum', bandeira: Bandeiras.MASTERCARD, tier: Tiers.PLATINUM },
  { id: 'c6_black', issuer_id: 'c6_bank', nome: 'C6 Black', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  { id: 'c6_carbon', issuer_id: 'c6_bank', nome: 'C6 Carbon', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  
  // --- XP --- (source: 42)
  { id: 'xp_inf', issuer_id: 'xp_investimentos', nome: 'XP Visa Infinite', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'xp_inf_privilege', issuer_id: 'xp_investimentos', nome: 'XP Visa Infinite Privilege', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },

  // --- PICPAY --- (source: 45)
  { id: 'picpay_std', issuer_id: 'picpay', nome: 'PicPay Card', bandeira: Bandeiras.MASTERCARD, tier: Tiers.STANDARD },
  { id: 'picpay_gold', issuer_id: 'picpay', nome: 'PicPay Card Gold', bandeira: Bandeiras.MASTERCARD, tier: Tiers.GOLD },
  
  // --- MERCADO PAGO --- (source: 48)
  { id: 'mp_std', issuer_id: 'mercado_pago', nome: 'Mercado Pago Crédito', bandeira: Bandeiras.VISA, tier: Tiers.STANDARD },
  { id: 'mp_plat', issuer_id: 'mercado_pago', nome: 'Mercado Pago Platinum', bandeira: Bandeiras.VISA, tier: Tiers.PLATINUM },

  // --- NEON --- (source: 51)
  { id: 'neon_std', issuer_id: 'neon', nome: 'Neon Crédito', bandeira: Bandeiras.VISA, tier: Tiers.STANDARD },
  { id: 'neon_gold', issuer_id: 'neon', nome: 'Neon Gold', bandeira: Bandeiras.VISA, tier: Tiers.GOLD },
  
  // --- SICREDI --- (source: 54)
  { id: 'sicredi_std', issuer_id: 'sicredi', nome: 'Sicredi (Clássico/Gold/Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'sicredi_inf', issuer_id: 'sicredi', nome: 'Sicredi Visa Infinite', bandeira: Bandeiras.VISA, tier: Tiers.INFINITE },
  { id: 'sicredi_black', issuer_id: 'sicredi', nome: 'Sicredi Mastercard Black', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  
  // --- SICOOB --- (source: 57)
  { id: 'sicoob_std', issuer_id: 'sicoob', nome: 'Sicoobcard (Clássico/Gold/Platinum)', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'sicoob_black', issuer_id: 'sicoob', nome: 'Sicoobcard Mastercard Black', bandeira: Bandeiras.MASTERCARD, tier: Tiers.BLACK },
  
  // --- PORTO BANK --- (source: 60)
  { id: 'porto_std', issuer_id: 'porto_bank', nome: 'Porto Bank (Anuidade Grátis)', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'porto_gold', issuer_id: 'porto_bank', nome: 'Porto Bank Gold', bandeira: Bandeiras.GENERIC, tier: Tiers.GOLD },
  { id: 'porto_plat', issuer_id: 'porto_bank', nome: 'Porto Bank Platinum', bandeira: Bandeiras.GENERIC, tier: Tiers.PLATINUM },
  
  // --- PRODUTOS GENÉRICOS ---
  // Um "fallback" para cada emissor, caso o usuário não encontre o seu.
  { id: 'nubank_generic', issuer_id: 'nubank', nome: 'Outro Cartão Nubank', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'itau_generic', issuer_id: 'itau_unibanco', nome: 'Outro Cartão Itaú', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'bradesco_generic', issuer_id: 'bradesco', nome: 'Outro Cartão Bradesco', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'bb_generic', issuer_id: 'banco_do_brasil', nome: 'Outro Cartão BB', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'santander_generic', issuer_id: 'santander', nome: 'Outro Cartão Santander', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'caixa_generic', issuer_id: 'caixa', nome: 'Outro Cartão Caixa', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'inter_generic', issuer_id: 'banco_inter', nome: 'Outro Cartão Inter', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'c6_generic', issuer_id: 'c6_bank', nome: 'Outro Cartão C6', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'xp_generic', issuer_id: 'xp_investimentos', nome: 'Outro Cartão XP', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'picpay_generic', issuer_id: 'picpay', nome: 'Outro Cartão PicPay', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'mp_generic', issuer_id: 'mercado_pago', nome: 'Outro Cartão Mercado Pago', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'neon_generic', issuer_id: 'neon', nome: 'Outro Cartão Neon', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'sicredi_generic', issuer_id: 'sicredi', nome: 'Outro Cartão Sicredi', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'sicoob_generic', issuer_id: 'sicoob', nome: 'Outro Cartão Sicoob', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  { id: 'porto_generic', issuer_id: 'porto_bank', nome: 'Outro Cartão Porto Bank', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
  
  // --- Produto "Outros" ---
  // Para contas que não têm um emissor definido (ex: "Dinheiro em Espécie")
  { id: 'generic_card', issuer_id: 'generic', nome: 'Outro Cartão de Crédito', bandeira: Bandeiras.GENERIC, tier: Tiers.STANDARD },
];

/**
 * Função utilitária para buscar produtos por emissor.
 * Isso será usado no `AddPaymentMethodModal` para filtrar a lista.
 * @param {string} issuerId - O ID do emissor (ex: 'itau_unibanco')
 * @returns {Array} - Um array de produtos de cartão filtrados.
 */
export const getProductsByIssuer = (issuerId) => {
  if (!issuerId || issuerId === 'generic') {
    return CARD_PRODUCTS.filter(p => p.issuer_id === 'generic');
  }
  
  // Retorna os cartões específicos E o genérico daquele emissor
  return CARD_PRODUCTS.filter(
    p => p.issuer_id === issuerId
  );
};