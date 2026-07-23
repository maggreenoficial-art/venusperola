export const wellnessPositioning = {
  headline: "Sexual Wellness, não tabu.",
  subheadline:
    "Ferramentas de saúde íntima, bem-estar e conexão — com a elegância que você merece.",
  description:
    "Assim como LELO e Adam & Eve reposicionaram o prazer como autocuidado, a Vênus Pérola trata cada produto como um investimento em saúde sexual, relacionamento e empoderamento feminino.",
  pillars: [
    {
      id: "saude",
      title: "Saúde Íntima",
      text: "Produtos body-safe, hipoalergênicos e desenvolvidos com silicone médico.",
    },
    {
      id: "bem-estar",
      title: "Bem-Estar",
      text: "Prazer como parte do autocuidado — redução de estresse, sono melhor, autoestima.",
    },
    {
      id: "relacionamento",
      title: "Conexão",
      text: "Ferramentas para explorar o corpo a dois, com comunicação e confiança.",
    },
  ],
} as const;

export const marketingStrategies = [
  {
    id: "wellness",
    title: "Reframe Wellness",
    description:
      "Reposicionamos o prazer como saúde, bem-estar e relacionamento — não vergonha.",
    reference: "LELO · Adam & Eve",
    href: "/bem-estar",
  },
  {
    id: "educacao",
    title: "Educação",
    description:
      "Guias, FAQs e conteúdo que desmistificam materiais, uso seguro e autocuidado.",
    reference: "Guias & tutoriais",
    href: "/guias",
  },
  {
    id: "influencers",
    title: "Sex-Positive",
    description:
      "Parcerias com criadores que promovem saúde sexual, empoderamento e informação.",
    reference: "Instagram · TikTok",
    href: "/bem-estar#comunidade",
  },
  {
    id: "seo",
    title: "SEO & Conteúdo",
    description:
      "Artigos otimizados para buscas orgânicas — canal essencial quando ads são restritos.",
    reference: "Blog & guias",
    href: "/guias",
  },
  {
    id: "discreto",
    title: "Envio Discreto",
    description:
      "Embalagem neutra, fatura discreta e ritual de unboxing premium sem exposição.",
    reference: "Padrão do setor",
    href: "/bem-estar#discrecao",
  },
  {
    id: "email",
    title: "Email Marketing",
    description:
      "Newsletter própria, livre de censura — ofertas, guias e programa de fidelidade.",
    reference: "Clube Vênus",
    href: "#newsletter",
  },
  {
    id: "diversidade",
    title: "Diversidade",
    description:
      "Produtos e linguagem inclusivos para todos os corpos, orientações e identidades.",
    reference: "LGBTQ+ friendly",
    href: "/bem-estar#inclusao",
  },
  {
    id: "tech",
    title: "Inovação Tech",
    description:
      "Vibradores com app, aquecimento inteligente, múltiplos motores e controle remoto.",
    reference: "We-Vibe · LELO",
    href: "/colecoes/perola-secreta",
  },
  {
    id: "causa",
    title: "Impacto Social",
    description:
      "Associamos a marca a causas de saúde reprodutiva e educação sexual.",
    reference: "DKT International",
    href: "/bem-estar#impacto",
  },
] as const;

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  category: "educacao" | "wellness" | "compra" | "cuidados";
  readTime: string;
  seoKeywords: string[];
  sections: { heading: string; body: string }[];
}

export const guides: Guide[] = [
  {
    slug: "como-escolher-seu-primeiro-produto",
    title: "Como escolher seu primeiro produto de bem-estar íntimo",
    excerpt:
      "Guia completo para iniciantes: tipos de estimuladores, tamanhos, materiais e o que considerar antes de comprar.",
    category: "compra",
    readTime: "6 min",
    seoKeywords: [
      "primeiro vibrador",
      "como escolher estimulador",
      "sexual wellness guia",
      "bem-estar íntimo feminino",
    ],
    sections: [
      {
        heading: "Comece pelo que você já conhece",
        body: "Se você já se estimula manualmente, um bullet vibrador ou estimulador de sucção clitoriana costuma ser o ponto de partida mais natural. Não existe produto 'certo' — existe o produto certo para o seu corpo e momento.",
      },
      {
        heading: "Materiais importam",
        body: "Priorize silicone médico, ABS body-safe e evite materiais porosos como jelly em produtos de penetração. Todos os produtos Vênus Pérola são selecionados com critério body-safe e hipoalergênico.",
      },
      {
        heading: "Tamanho e intensidade",
        body: "Para iniciantes, prefira tamanhos menores, texturas suaves e múltiplas velocidades. Você pode aumentar a intensidade conforme descobre suas preferências — sem pressa.",
      },
      {
        heading: "Privacidade na compra",
        body: "Nossa entrega é 100% discreta: caixa neutra, sem menção à loja na fatura. Você recebe em casa com total sigilo.",
      },
    ],
  },
  {
    slug: "materiais-body-safe",
    title: "Materiais body-safe: o que é seguro para o seu corpo",
    excerpt:
      "Silicone médico, ftalatos, porosidade — entenda os materiais dos produtos íntimos e como identificar o que é seguro.",
    category: "educacao",
    readTime: "5 min",
    seoKeywords: [
      "silicone médico vibrador",
      "body safe sex toy",
      "materiais seguros brinquedos íntimos",
    ],
    sections: [
      {
        heading: "Silicone médico",
        body: "O padrão ouro do setor. Não poroso, fácil de limpar, hipoalergênico e compatível com a maioria dos lubrificantes à base de água. Todos os vibradores premium da Vênus Pérola utilizam silicone de grau médico.",
      },
      {
        heading: "O que evitar",
        body: "Materiais porosos (como jelly barato) podem abrigar bactérias mesmo após a limpeza. Produtos com cheiro forte de plástico geralmente contêm ftalatos — substâncias que devem ser evitadas em contato com mucosas.",
      },
      {
        heading: "ABS e aço inoxidável",
        body: "Seguros para plugs e acessórios rígidos. ABS é não poroso e fácil de higienizar. Aço inoxidável médico é ideal para temperatura play quando usado com cuidado.",
      },
    ],
  },
  {
    slug: "como-limpar-e-cuidar",
    title: "Como limpar e cuidar dos seus produtos",
    excerpt:
      "Higiene correta prolonga a vida útil do produto e protege sua saúde íntima. Passo a passo simples.",
    category: "cuidados",
    readTime: "4 min",
    seoKeywords: [
      "como limpar vibrador",
      "higiene brinquedos íntimos",
      "cuidados produtos sex shop",
    ],
    sections: [
      {
        heading: "Após cada uso",
        body: "Lave com água morna e sabão neutro ou use um cleaner específico para brinquedos íntimos. Seque completamente antes de guardar.",
      },
      {
        heading: "Armazenamento",
        body: "Guarde em saquinho de cetim ou estojo individual. Evite contato entre silicone e silicone sem barreira — pode causar reação química.",
      },
      {
        heading: "Produtos recarregáveis",
        body: "Carregue completamente antes do primeiro uso. Evite deixar descarregado por longos períodos para preservar a bateria.",
      },
    ],
  },
  {
    slug: "prazer-relacionamento-bem-estar",
    title: "Prazer, relacionamento e bem-estar: a ciência por trás",
    excerpt:
      "Orgasmos reduzem cortisol, melhoram o sono e fortalecem vínculos. Entenda o prazer como pilar de saúde.",
    category: "wellness",
    readTime: "7 min",
    seoKeywords: [
      "benefícios orgasmo saúde",
      "sexual wellness relacionamento",
      "bem-estar sexual feminino",
    ],
    sections: [
      {
        heading: "Prazer como saúde",
        body: "Estudos mostram que o orgasmo libera ocitocina e endorfinas, reduzindo estresse e ansiedade. Tratar o prazer como autocuidado — assim como exercício ou meditação — é um reframe poderoso e baseado em evidências.",
      },
      {
        heading: "A dois ou solo",
        body: "Produtos íntimos não substituem parceiros — eles ampliam possibilidades. Muitos casais usam vibradores juntos como forma de explorar, comunicar desejos e aumentar a intimidade.",
      },
      {
        heading: "Sem culpa, sem tabu",
        body: "A Vênus Pérola existe para normalizar a conversa. Você merece conhecer seu corpo, investir no seu bem-estar e fazer isso com elegância.",
      },
    ],
  },
  {
    slug: "guia-de-compra-discreta",
    title: "Guia de compra discreta: privacidade do clique à entrega",
    excerpt:
      "Como comprar com total sigilo: embalagem, fatura, rastreio e dicas para receber em casa com tranquilidade.",
    category: "compra",
    readTime: "3 min",
    seoKeywords: [
      "sex shop entrega discreta",
      "comprar vibrador sigilo",
      "embalagem discreta brasil",
    ],
    sections: [
      {
        heading: "Embalagem externa",
        body: "Caixa de papelão pardo ou envelope neutro, sem logotipos, sem menção ao conteúdo. O remetente aparece como 'VP Comercio Online' — discreto e profissional.",
      },
      {
        heading: "Fatura e pagamento",
        body: "Na fatura do cartão, a cobrança aparece como 'VP Comercio Online'. PIX e boleto também sem referência explícita à natureza dos produtos.",
      },
      {
        heading: "Ritual de unboxing",
        body: "Por dentro, a experiência é premium: caixa de joia, perfume exclusivo e bilhete selado. Discrição por fora, luxo por dentro.",
      },
    ],
  },
];

export const faqs = [
  {
    q: "Os produtos são seguros para o corpo?",
    a: "Sim. Selecionamos apenas materiais body-safe: silicone médico, ABS hipoalergênico e componentes livres de ftalatos.",
  },
  {
    q: "A entrega é realmente discreta?",
    a: "100%. Embalagem neutra, sem menção à loja na caixa ou na fatura do cartão. Remetente: VP Comercio Online.",
  },
  {
    q: "Posso comprar se nunca usei um produto assim?",
    a: "Claro. Nossos guias educativos ajudam na escolha e nosso atendimento recomenda produtos para iniciantes sem julgamento.",
  },
  {
    q: "Os produtos servem para todos os corpos?",
    a: "Sim. Nossa curadoria inclui opções para diferentes anatomias, orientações e experiências. Inclusão é parte da nossa missão.",
  },
  {
    q: "Vocês apoiam alguma causa social?",
    a: "Destinamos parte das vendas para educação em saúde reprodutiva e campanhas de prevenção. Saiba mais em /bem-estar#impacto.",
  },
] as const;

export const diversityContent = {
  headline: "Prazer para todos os corpos",
  text: "Independentemente da sua orientação, identidade de gênero ou experiência, você é bem-vinda na Vênus Pérola. Nossos produtos e linguagem são inclusivos — porque saúde sexual é direito de todas as pessoas.",
  points: [
    "Produtos para uso solo, a dois ou em qualquer configuração",
    "Linguagem neutra e acolhedora em todo o site",
    "Curadoria LGBTQ+ friendly",
    "Sem estereótipos de gênero na recomendação de produtos",
  ],
} as const;

export const socialImpact = {
  headline: "Prazer com propósito",
  text: "Inspirados em marcas como Adam & Eve e sua parceria com a DKT International, a Vênus Pérola destina parte das vendas para educação em saúde reprodutiva e prevenção.",
  causes: [
    {
      title: "Educação Sexual",
      text: "Apoio a ONGs que promovem informação de qualidade sobre saúde íntima.",
    },
    {
      title: "Saúde Reprodutiva",
      text: "Contribuição para campanhas de prevenção e acesso a recursos de saúde.",
    },
    {
      title: "Desestigmatização",
      text: "Conteúdo gratuito que normaliza o prazer feminino e a autonomia corporal.",
    },
  ],
} as const;

export const techHighlights = [
  {
    title: "Controle por App",
    description: "Vibradores inteligentes com conexão Bluetooth para personalização total.",
    productSlug: "whale-connect-bullet-inteligente-c-app",
  },
  {
    title: "Aquecimento Inteligente",
    description: "Tecnologia de aquecimento a 42°C para sensações mais realistas.",
    productSlug: "heat-pleasure-vibrador-c-aquecimento-42-c",
  },
  {
    title: "Sucção & Pulsação",
    description: "Ondas de ar e pulsação que imitam estimulação oral com precisão.",
    productSlug: "suction-pro-estimulador-de-succao-clitoriana",
  },
] as const;

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getGuidesByCategory(category: Guide["category"]) {
  return guides.filter((g) => g.category === category);
}
