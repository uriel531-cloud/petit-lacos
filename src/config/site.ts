/** Dados fixos da marca. O que a dona edita pelo painel fica em StoreSettings (banco). */
export const siteConfig = {
  name: "Petit Laços",
  tagline: "Seu próximo laço favorito está aqui",
  slogan: "Feito à mão com carinho para quem você ama",
  description:
    "Laços e acessórios infantis feitos à mão: laços de cabelo, faixinhas baby, parzinhos e kits para presente.",
  locale: "pt-BR",
  currency: "BRL",
  logo: {
    /** Logo completa (nome + laço), fundo transparente — usar sobre Azul Petit ou Azul Céu */
    transparent: "/brand/logo-sem-fundo.webp",
    /** Logo completa com o fundo Azul Petit */
    withBackground: "/brand/logo-original.webp",
    /** Só o laço, para espaços pequenos */
    symbol: "/brand/simbolo-laco.webp",
    /** Laço sobre o quadrado Azul Petit (avatar das redes) */
    avatar: "/brand/avatar-laco.webp",
  },
} as const;
