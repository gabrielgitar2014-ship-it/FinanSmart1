/**
 * Catálogo de Emissores (Bancos e Instituições).
 * Esta é a fonte da verdade para o branding (marca, cor, logo)
 * de uma 'account' e de um 'payment_method'.
 * * O 'id' aqui (ex: 'nubank', 'itau_unibanco') será armazenado
 * nas colunas 'issuer_id' das tabelas 'accounts' e 'payment_methods'.
 */
export const ISSUERS = {
  bancodobrasil: {
    nome: "Banco do Brasil",
    logo: "/logos/bancodobrasil.png",
    cor: "#F7D700",
  },
  nubank: {
    nome: "Nubank",
    logo: "/logos/nubank.png",
    cor: "#8A05BE",
  },
  itau: {
    nome: "Itaú",
    logo: "/logos/itau.png",
    cor: "#EC7000",
  },
  bradesco: {
    nome: "Bradesco",
    logo: "/logos/bradesco.png",
    cor: "#CC092F",
  },
  santander: {
    nome: "Santander",
    logo: "/logos/santander.png",
    cor: "#D50000",
  },
  caixa: {
    nome: "Caixa",
    logo: "/logos/caixa.png",
    cor: "#005CA8",
  },
  inter: {
    nome: "Inter",
    logo: "/logos/inter.png",
    cor: "#FF7A00",
  },
  c6: {
    nome: "C6 Bank",
    logo: "/logos/c6.png",
    cor: "#000000",
  },
  sicredi: {
    nome: "Sicredi",
    logo: "/logos/sicredi.png",
    cor: "#4CAF50",
  },
  sicoob: {
    nome: "Sicoob",
    logo: "/logos/sicoob.png",
    cor: "#006634",
  },
  generic: {
    nome: "Conta",
    logo: "/logos/generic.png",
    cor: "#4B5563",
  },
};