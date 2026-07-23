export type Category =
  | "vibradores"
  | "penis-realisticos"
  | "plug-anal";

export type VariationType = "cor" | "tamanho";

export interface ProductVariant {
  id: string;
  supplierCode: string;
  label: string;
  price: number;
  stock: number;
  image: string;
  originalName: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  subcategory: string;
  line: string;
  description: string;
  fullDescription: string;
  tags: string[];
  highlights: string[];
  variationType: VariationType | null;
  variants: ProductVariant[];
  featured?: boolean;
}

export const categories: { id: Category; label: string }[] = [
  { id: "vibradores", label: "Vibradores" },
  { id: "penis-realisticos", label: "Pênis Realísticos" },
  { id: "plug-anal", label: "Plug Anal" },
];

export const products: Product[] = [
  {
    "id": "5414",
    "slug": "coelhinho-estimulador-duplo-edicao-luxo",
    "name": "Coelhinho Estimulador Duplo - Edição Luxo",
    "category": "vibradores",
    "subcategory": "Estimuladores Clitorianos",
    "line": "Estimuladores Clitorianos",
    "description": "Mini vibrador em formato de orelhinhas de coelho com dupla estimulação. Silicone macio, 10 modos de vibração e design ergonômico.",
    "fullDescription": "Descubra o prazer duplo com nosso estimulador em formato de orelhinhas de coelho. Feito em silicone premium hipoalergênico, oferece 10 modos de vibração intensos para uma estimulação precisa e prazerosa. Design ergonômico que se adapta perfeitamente ao corpo feminino, ideal para uso solo ou a dois. À prova d'água para momentos de prazer no banho. Recarregável via USB com autonomia de até 90 minutos. Tamanho compacto e discreto para levar na bolsa. Cor: Rosa vibrante.",
    "tags": [
      "coelhinho",
      "vibrador",
      "estimulador",
      "clitóris",
      "silicone",
      "recarregável",
      "discreto"
    ],
    "highlights": [
      "10 modos de vibração",
      "Silicone premium",
      "À prova d'água",
      "USB recarregável"
    ],
    "variationType": null,
    "variants": [
      {
        "id": "5414",
        "supplierCode": "5414",
        "label": "5414",
        "price": 36,
        "stock": 3,
        "image": "/products/5414.svg",
        "originalName": "Mini Orelhas do Coelho - Boyce - Pretty Love"
      }
    ],
    "featured": true
  },
  {
    "id": "6791",
    "slug": "explorador-g-vibrador-curvado-multi-velocidade",
    "name": "Explorador G - Vibrador Curvado Multi-Velocidade",
    "category": "vibradores",
    "subcategory": "Ponto G",
    "line": "Ponto G",
    "description": "Vibrador curvado especialmente projetado para estimular o ponto G com precisão. Múltiplas velocidades de vibração.",
    "fullDescription": "O Explorador G foi desenvolvido para quem busca descobrir novas sensações. Sua curvatura precisa atinge o ponto G com facilidade, enquanto as múltiplas velocidades de vibração permitem personalizar cada momento. Corpo em silicone macio de alta qualidade, textura suave ao toque e acabamento impecável. Controle intuitivo de velocidades para ir do sussurro ao intenso. Funciona com pilhas (incluídas na primeira compra). Tamanho ideal para iniciantes e experientes. Cor: Rosa elegante.",
    "tags": [
      "ponto g",
      "vibrador",
      "curvado",
      "multi-velocidade",
      "silicone",
      "feminino",
      "prazer"
    ],
    "highlights": [
      "Curvatura precisa",
      "Multi-velocidade",
      "Silicone macio",
      "Ideal para iniciantes"
    ],
    "variationType": "cor",
    "variants": [
      {
        "id": "6791-RS",
        "supplierCode": "6791-RS",
        "label": "Rosa",
        "price": 70.14,
        "stock": 1,
        "image": "/products/6791-rs.svg",
        "originalName": "Vibrador de Ponto G Multi-Velocidade - Maig - Rosa"
      },
      {
        "id": "6791-RX",
        "supplierCode": "6791-RX",
        "label": "Roxo",
        "price": 70.14,
        "stock": 1,
        "image": "/products/6791-rx.svg",
        "originalName": "Vibrador de Ponto G Multi-Velocidade - Maig - Roxo"
      }
    ],
    "featured": true
  },
  {
    "id": "5367",
    "slug": "duo-power-vibrador-jelly-duplo-motor",
    "name": "Duo Power - Vibrador Jelly Duplo Motor",
    "category": "vibradores",
    "subcategory": "Dupla Estimulação",
    "line": "Dupla Estimulação",
    "description": "Vibrador jelly com dois motores independentes para estimulação interna e externa simultânea. Textura suave e flexível.",
    "fullDescription": "O Duo Power revoluciona sua experiência com dois motores independentes que trabalham em harmonia. A haste curvada massageia internamente enquanto o prolongador externo cuida da estimulação clitoriana — tudo ao mesmo tempo. Material jelly premium, super flexível e macio ao toque, que se adapta aos contornos do corpo. 15cm de puro prazer com textura realista e veias delicadas. Múltiplas velocidades controladas por botão giratório. Funciona com pilhas. Cor: Pink sedutor.",
    "tags": [
      "duplo motor",
      "vibrador",
      "jelly",
      "estimulação dupla",
      "clitóris",
      "interno",
      "feminino"
    ],
    "highlights": [
      "Dois motores independentes",
      "Jelly premium flexível",
      "Estimulação dupla simultânea",
      "15cm"
    ],
    "variationType": null,
    "variants": [
      {
        "id": "5367-LL",
        "supplierCode": "5367-LL",
        "label": "Lilás",
        "price": 75.6,
        "stock": 1,
        "image": "/products/5367-ll.svg",
        "originalName": "Vibrador Jelly Duplo Motor - 15cm - Pink"
      }
    ],
    "featured": true
  },
  {
    "id": "8250",
    "slug": "pulse-touch-vibrador-de-pulsacao-inteligente",
    "name": "Pulse Touch - Vibrador de Pulsação Inteligente",
    "category": "vibradores",
    "subcategory": "Pulsação",
    "line": "Pulsação",
    "description": "Vibrador de pulsação com tecnologia de ondas de prazer. Estimulação profunda e diferenciada do clitóris e ponto G.",
    "fullDescription": "O Pulse Touch traz uma tecnologia revolucionária: ondas de pulsação que penetram mais profundamente que a vibração tradicional. Ideal para quem busca uma experiência completamente nova. O motor de pulsação simula a sucção e a pressão de forma única, criando sensações intensas e inesquecíveis. Design moderno com cabo ergonômico para fácil manuseio. Silicone médico hipoalergênico, seguro para o corpo. À prova d'água para uso no chuveiro. Múltiplos modos de pulsação. Cor: Rosa delicado.",
    "tags": [
      "pulsação",
      "vibrador",
      "tecnologia",
      "ondas",
      "clitóris",
      "ponto g",
      "inovador"
    ],
    "highlights": [
      "Tecnologia de pulsação",
      "Ondas profundas",
      "Silicone médico",
      "À prova d'água"
    ],
    "variationType": "cor",
    "variants": [
      {
        "id": "8250-RS",
        "supplierCode": "8250-RS",
        "label": "Rosa",
        "price": 87.5,
        "stock": 1,
        "image": "/products/8250-rs.svg",
        "originalName": "Vibrador de Pulsação - Billy - Rosa"
      },
      {
        "id": "8250-RX",
        "supplierCode": "8250-RX",
        "label": "Roxo",
        "price": 87.5,
        "stock": 1,
        "image": "/products/8250-rx.svg",
        "originalName": "Vibrador de Pulsação - Billy - Roxo"
      }
    ],
    "featured": true
  },
  {
    "id": "5208",
    "slug": "g-spot-pro-vibrador-duplo-motor-17cm",
    "name": "G-Spot Pro - Vibrador Duplo Motor 17cm",
    "category": "vibradores",
    "subcategory": "Ponto G Premium",
    "line": "Ponto G Premium",
    "description": "Vibrador premium com dois motores independentes, 17cm de comprimento, curvatura perfeita para o ponto G e estimulador clitoriano.",
    "fullDescription": "O G-Spot Pro é a escolha definitiva para quem não abre mão da qualidade. Com dois motores independentes e 17cm de puro poder, oferece estimulação dupla simultânea: a haste curvada massageia o ponto G com precisão cirúrgica enquanto o estimulador externo cuida do clitóris. 12 modos de vibração combináveis entre os dois motores. Silicone premium de grau médico, totalmente hipoalergênico e livre de ftalatos. Acabamento impecável com textura veludada. Recarregável via USB com indicador LED de bateria. Embalagem premium ideal para presente. Cor: Pink sofisticado.",
    "tags": [
      "ponto g",
      "premium",
      "duplo motor",
      "17cm",
      "silicone médico",
      "recarregável",
      "presente"
    ],
    "highlights": [
      "Dois motores independentes",
      "12 modos combináveis",
      "17cm",
      "Silicone médico",
      "USB recarregável"
    ],
    "variationType": null,
    "variants": [
      {
        "id": "5208-PK",
        "supplierCode": "5208-PK",
        "label": "Pink",
        "price": 91.49,
        "stock": 1,
        "image": "/products/5208-pk.svg",
        "originalName": "Vibrador Ponto G Duplo Motor - 17cm - Pretty Love - Pink"
      }
    ],
    "featured": true
  },
  {
    "id": "9262",
    "slug": "whale-connect-bullet-inteligente-c-app",
    "name": "Whale Connect - Bullet Inteligente c/ App",
    "category": "vibradores",
    "subcategory": "App/Bluetooth",
    "line": "App/Bluetooth",
    "description": "Bullet vibratório em formato de baleia controlado por aplicativo. Ideal para brincadeiras à distância com o parceiro.",
    "fullDescription": "A tecnologia encontra o prazer no Whale Connect. Este bullet em formato de baleia é controlado totalmente pelo seu smartphone via aplicativo gratuito. Perfeito para relacionamentos à distância: seu parceiro pode controlar as vibrações de qualquer lugar do mundo. 10 modos de vibração pré-programados + possibilidade de criar padrões personalizados. Conexão Bluetooth estável e alcance de até 10 metros. Silicone macio e flexível com design anatômico. À prova d'água para diversão no banho. Bateria de longa duração com recarga USB magnética. Cor: Rosa romântico.",
    "tags": [
      "app",
      "bluetooth",
      "bullet",
      "controle remoto",
      "à distância",
      "casal",
      "tecnologia"
    ],
    "highlights": [
      "Controle via APP",
      "Relacionamento à distância",
      "10 modos + personalizados",
      "Bluetooth 10m"
    ],
    "variationType": "cor",
    "variants": [
      {
        "id": "9262-RS",
        "supplierCode": "9262-RS",
        "label": "Rosa",
        "price": 81,
        "stock": 3,
        "image": "/products/9262-rs.svg",
        "originalName": "Bullet Baleia - Whale - APP - Rosa"
      },
      {
        "id": "9262-RX",
        "supplierCode": "9262-RX",
        "label": "Roxo",
        "price": 81,
        "stock": 3,
        "image": "/products/9262-rx.svg",
        "originalName": "Bullet Baleia - Whale - APP - Roxo"
      }
    ],
    "featured": true
  },
  {
    "id": "8430",
    "slug": "heat-pleasure-vibrador-c-aquecimento-42-c",
    "name": "Heat Pleasure - Vibrador c/ Aquecimento 42°C",
    "category": "vibradores",
    "subcategory": "Aquecimento",
    "line": "Aquecimento",
    "description": "Vibrador 3 em 1: estimula o ponto G, o clitóris e aquece até 42°C. A sensação de calor intensifica o prazer naturalmente.",
    "fullDescription": "O Heat Pleasure é o ápice da inovação em prazer feminino. Este vibrador 3 em 1 combina estimulação do ponto G, massagem clitoriana e aquecimento inteligente até 42°C — a temperatura ideal para aumentar a circulação sanguínea e intensificar as sensações. O calor natural relaxa os músculos e prepara o corpo para um orgasmo mais intenso. Dois motores independentes com 8 modos de vibração cada. Silicone de grau médico, ultra macio e seguro. Aquecimento rápido em 2 minutos. Recarregável via USB com até 120 minutos de autonomia. Display LED intuitivo. Cor: Rosa quente.",
    "tags": [
      "aquecimento",
      "42 graus",
      "ponto g",
      "clitóris",
      "3 em 1",
      "premium",
      "inovador"
    ],
    "highlights": [
      "Aquecimento 42°C",
      "3 em 1 (Ponto G + Clitóris + Calor)",
      "8 modos duplos",
      "Silicone médico"
    ],
    "variationType": "cor",
    "variants": [
      {
        "id": "8430-RS",
        "supplierCode": "8430-RS",
        "label": "Rosa",
        "price": 232.14,
        "stock": 1,
        "image": "/products/8430-rs.svg",
        "originalName": "Vibrador Ponto G e Clitóris c/ Aquecimento - Rosa"
      },
      {
        "id": "8430-LL",
        "supplierCode": "8430-LL",
        "label": "Lilás",
        "price": 232.14,
        "stock": 1,
        "image": "/products/8430-ll.svg",
        "originalName": "Vibrador Ponto G e Clitóris c/ Aquecimento - Lilás"
      }
    ],
    "featured": true
  },
  {
    "id": "8147",
    "slug": "suction-pro-estimulador-de-succao-clitoriana",
    "name": "Suction Pro - Estimulador de Sucção Clitoriana",
    "category": "vibradores",
    "subcategory": "Sucção",
    "line": "Sucção",
    "description": "Estimulador de sucção clitoriana com tecnologia de ondas de ar. Simula a sensação de sexo oral com intensidade ajustável.",
    "fullDescription": "O Suction Pro revolucionou o mercado com sua tecnologia de ondas de pressão de ar. Ao invés de vibração tradicional, ele cria ondas de sucção que simulam perfeitamente a sensação de sexo oral. 10 níveis de intensidade que vão do toque de pena ao tornado de prazer. Cabeça removível em silicone médico para fácil higienização. Design discreto que parece um difusor de perfumes — ninguém vai desconfiar. Silencioso mesmo nos níveis mais altos. Recarregável via USB com autonomia de 2 horas. À prova d'água. Cor: Azul oceano.",
    "tags": [
      "sucção",
      "clitóris",
      "ondas de ar",
      "sexo oral",
      "discreto",
      "silencioso",
      "inovador"
    ],
    "highlights": [
      "Tecnologia ondas de ar",
      "Simula sexo oral",
      "10 níveis",
      "Design discreto",
      "Silencioso"
    ],
    "variationType": "cor",
    "variants": [
      {
        "id": "8147-AZ",
        "supplierCode": "8147-AZ",
        "label": "Azul",
        "price": 186.2,
        "stock": 1,
        "image": "/products/8147-az.svg",
        "originalName": "Vibrador Sucção Clitóris - Quentin - Azul"
      },
      {
        "id": "8147-RS",
        "supplierCode": "8147-RS",
        "label": "Rosa",
        "price": 186.2,
        "stock": 1,
        "image": "/products/8147-rs.svg",
        "originalName": "Vibrador Sucção Clitóris - Quentin - Rosa"
      }
    ],
    "featured": true
  },
  {
    "id": "9192",
    "slug": "real-feel-classic-penis-realistico-c-ventosa-20cm",
    "name": "Real Feel Classic - Pênis Realístico c/ Ventosa 20cm",
    "category": "penis-realisticos",
    "subcategory": "Com Ventosa",
    "line": "Com Ventosa",
    "description": "Pênis realístico com ventosa poderosa para uso em superfícies lisas. Textura realista com veias e glande detalhada.",
    "fullDescription": "O Real Feel Classic oferece a experiência mais próxima do real. Com 20cm de comprimento e 3,7cm de diâmetro, possui textura realista com veias salientes, glande detalhada e escroto macio. A ventosa super poderosa fixa em qualquer superfície lisa (box, parede, chão) para mãos livres. Material TPE premium hipoalergênico, macio ao toque e flexível. Compatível com cintos de penetração. Fácil de limpar com água e sabão neutro. Ideal para iniciantes e experientes. Cor: Pele natural.",
    "tags": [
      "pênis",
      "realístico",
      "ventosa",
      "mãos livres",
      "20cm",
      "TPE",
      "iniciante"
    ],
    "highlights": [
      "Ventosa poderosa",
      "20cm realista",
      "Mãos livres",
      "TPE premium",
      "Compatível c/ cinto"
    ],
    "variationType": null,
    "variants": [
      {
        "id": "9192",
        "supplierCode": "9192",
        "label": "9192",
        "price": 78,
        "stock": 1,
        "image": "/products/9192.svg",
        "originalName": "Pênis Realístico c/ Ventosa - 20.0x3.7cm - Baile"
      }
    ],
    "featured": true
  },
  {
    "id": "8216",
    "slug": "vibe-real-penis-vibratorio-realistico",
    "name": "Vibe Real - Pênis Vibratório Realístico",
    "category": "penis-realisticos",
    "subcategory": "Vibratório",
    "line": "Vibratório",
    "description": "Pênis realístico com vibrador interno de múltiplas velocidades. Combina a sensação realista com a potência da vibração.",
    "fullDescription": "O Vibe Real une o melhor dos dois mundos: a aparência e textura realista de um pênis com a potência de um vibrador. Com 19cm de comprimento e 4,3cm de diâmetro, oferece preenchimento satisfatório. O vibrador interno possui múltiplas velocidades controladas por botão giratório na base. Veias salientes e glande detalhada aumentam a estimulação interna. Material TPE de alta qualidade, seguro para o corpo. Funciona com pilhas (incluídas). Base larga para uso seguro. Cor: Rosa sensual.",
    "tags": [
      "pênis",
      "vibratório",
      "realístico",
      "multi-velocidade",
      "19cm",
      "TPE",
      "preenchimento"
    ],
    "highlights": [
      "Realista + Vibrador",
      "19cm",
      "Multi-velocidade",
      "Veias salientes",
      "Base larga segura"
    ],
    "variationType": "cor",
    "variants": [
      {
        "id": "8216-RS",
        "supplierCode": "8216-RS",
        "label": "Rosa",
        "price": 54.18,
        "stock": 1,
        "image": "/products/8216-rs.svg",
        "originalName": "Pênis Realístico c/ Vibrador à pilha - Rosa"
      },
      {
        "id": "8216-RX",
        "supplierCode": "8216-RX",
        "label": "Roxo",
        "price": 54.18,
        "stock": 1,
        "image": "/products/8216-rx.svg",
        "originalName": "Pênis Realístico c/ Vibrador à pilha - Roxo"
      }
    ],
    "featured": true
  },
  {
    "id": "9034",
    "slug": "catoblepas-xxl-penis-vibratorio-premium-20-6cm",
    "name": "Catoblepas XXL - Pênis Vibratório Premium 20,6cm",
    "category": "penis-realisticos",
    "subcategory": "Vibratório Premium",
    "line": "Vibratório Premium",
    "description": "Pênis vibratório premium de 20,6cm com textura ultra realista. Motor potente com múltiplas velocidades para prazer intenso.",
    "fullDescription": "O Catoblepas XXL é a escolha de quem busca o máximo em prazer. Com impressionantes 20,6cm de comprimento e 4,4cm de diâmetro, oferece preenchimento profundo e satisfatório. O motor premium entrega vibrações potentes e silenciosas em múltiplas velocidades. Textura hiper-realista com veias pronunciadas, glande detalhada e escroto com textura de bolas. Material TPE de grau médico, extremamente macio e flexível. Controle de velocidade na base para ajuste instantâneo. Compatível com cintos de penetração. Embalagem premium. Cor: Pele bronzeada.",
    "tags": [
      "pênis",
      "premium",
      "XXL",
      "20.6cm",
      "vibratório",
      "potente",
      "preenchimento profundo"
    ],
    "highlights": [
      "20,6cm premium",
      "Motor potente e silencioso",
      "Textura hiper-realista",
      "TPE médico"
    ],
    "variationType": null,
    "variants": [
      {
        "id": "9034",
        "supplierCode": "9034",
        "label": "9034",
        "price": 201.6,
        "stock": 1,
        "image": "/products/9034.svg",
        "originalName": "Pênis Realístico c/ Vibrador - Catoblepas - Baile"
      }
    ],
    "featured": true
  },
  {
    "id": "7333",
    "slug": "barbara-power-penis-c-ventosa-super-forte-21cm",
    "name": "Barbara Power - Pênis c/ Ventosa Super Forte 21cm",
    "category": "penis-realisticos",
    "subcategory": "Com Ventosa",
    "line": "Com Ventosa",
    "description": "Pênis realístico com ventosa super forte de 21cm. Ideal para uso em qualquer superfície lisa com total liberdade de movimentos.",
    "fullDescription": "O Barbara Power é sinônimo de liberdade. Com 21cm de comprimento e 4,2cm de diâmetro, oferece preenchimento generoso. A ventosa industrial fixa com força impressionante em box, azulejo, espelho, chão — qualquer superfície lisa. Experimente posições infinitas com as mãos completamente livres. Textura realista com veias e glande detalhada. Material TPE premium, macio e flexível. Base larga com anel para facilitar a remoção. Fácil limpeza com água morna e sabão. Cor: Pele natural clara.",
    "tags": [
      "pênis",
      "ventosa",
      "super forte",
      "21cm",
      "mãos livres",
      "posições",
      "TPE"
    ],
    "highlights": [
      "Ventosa industrial",
      "21cm",
      "Mãos livres",
      "Base com anel",
      "Posições infinitas"
    ],
    "variationType": null,
    "variants": [
      {
        "id": "7333",
        "supplierCode": "7333",
        "label": "7333",
        "price": 70.14,
        "stock": 1,
        "image": "/products/7333.svg",
        "originalName": "Pênis Realístico c/ Ventosa - Barbara Calvin - Baile"
      }
    ],
    "featured": true
  },
  {
    "id": "jewel-plug",
    "slug": "jewel-plug",
    "name": "Jewel Plug",
    "category": "plug-anal",
    "subcategory": "Plug Anal com Pedra Decorativa",
    "line": "Plug Anal com Pedra Decorativa",
    "description": "Plug anal de silicone médico com pedra decorativa na base. Disponível em tamanho P para iniciantes e tamanho G para usuários experientes.",
    "fullDescription": "O Jewel Plug combina elegância e prazer em um acessório erótico sofisticado. Feito 100% em silicone médico hipoalergênico, disponível em tamanho P (iniciante) e tamanho G (avançado) com diversas opções de cor e pedra decorativa. A base em formato de joia garante segurança total durante o uso.",
    "tags": [
      "plug anal",
      "iniciante",
      "tamanho p",
      "silicone",
      "pedra decorativa",
      "vermelho",
      "seguro"
    ],
    "highlights": [
      "Tamanho P ideal iniciantes",
      "Silicone médico 100%",
      "Pedra decorativa",
      "Base segura"
    ],
    "variationType": "tamanho",
    "variants": [
      {
        "id": "7202-VM",
        "supplierCode": "7202-VM",
        "label": "P · Pedra Vermelha",
        "price": 20.44,
        "stock": 5,
        "image": "/products/7202-vm.svg",
        "originalName": "Plug Anal Silicone - Tam. P - Vermelho + Pedra TR"
      },
      {
        "id": "7204-RX",
        "supplierCode": "7204-RX",
        "label": "G · Roxo",
        "price": 40.6,
        "stock": 2,
        "image": "/products/7204-rx.svg",
        "originalName": "Plug Anal Silicone - Tam. G - Roxo + Pedra Dourada"
      },
      {
        "id": "7204-PK",
        "supplierCode": "7204-PK",
        "label": "G · Pink",
        "price": 40.6,
        "stock": 2,
        "image": "/products/7204-pk.svg",
        "originalName": "Plug Anal Silicone - Tam. G - Pink + Pedra Azul"
      },
      {
        "id": "7204-PT",
        "supplierCode": "7204-PT",
        "label": "G · Preto",
        "price": 40.6,
        "stock": 1,
        "image": "/products/7204-pt.svg",
        "originalName": "Plug Anal Silicone - Tam. G - Preta + Pedra Rosa"
      }
    ],
    "featured": false
  },
  {
    "id": "5279",
    "slug": "royal-rotator-vibrador-rotativo-recarregavel-36-niveis",
    "name": "Royal Rotator - Vibrador Rotativo Recarregável 36 Níveis",
    "category": "vibradores",
    "subcategory": "Rotativo Premium",
    "line": "Rotativo Premium",
    "description": "Vibrador rotativo recarregável com 36 níveis de vibração e 8 modos de rotação. Luxo e tecnologia para prazer máximo.",
    "fullDescription": "O Royal Rotator é a coroa da sua coleção. Este vibrador rotativo recarregável oferece 36 níveis de vibração combinados com 8 modos de rotação independentes — são 288 combinações possíveis de prazer. A haste rotativa realiza movimentos circulares internos enquanto o estimulador externo vibra, criando uma sinfonia de sensações. Motor duplo de alta performance, silencioso mesmo nos níveis mais altos. Silicone de grau médico com acabamento dourado luxuoso. Recarregável via USB com autonomia de até 3 horas. Display LED que mostra o modo ativo. À prova d'água. Embalagem premium com estojo de veludo. Cor: Dourado royal.",
    "tags": [
      "rotativo",
      "recarregável",
      "36 níveis",
      "8 rotações",
      "premium",
      "luxo",
      "dourado"
    ],
    "highlights": [
      "36 níveis + 8 rotações",
      "288 combinações",
      "Motor duplo silencioso",
      "Display LED",
      "3h autonomia"
    ],
    "variationType": null,
    "variants": [
      {
        "id": "5279-DR",
        "supplierCode": "5279-DR",
        "label": "Dourado",
        "price": 177.42,
        "stock": 5,
        "image": "/products/5279-dr.svg",
        "originalName": "Vibrador Rotativo RECARREGÁVEL - 36 Níveis - Dourado"
      }
    ],
    "featured": false
  }
];

export function getMinPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function getMaxPrice(product: Product): number {
  return Math.max(...product.variants.map((v) => v.price));
}

export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function getDefaultVariant(product: Product): ProductVariant {
  const inStock = product.variants.find((v) => v.stock > 0);
  return inStock ?? product.variants[0];
}

export function getVariantById(
  product: Product,
  variantId: string
): ProductVariant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function formatPriceRange(product: Product): string {
  const min = getMinPrice(product);
  const max = getMaxPrice(product);
  if (min === max) return formatPrice(min);
  return `A partir de ${formatPrice(min)}`;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsInStock(): Product[] {
  return products.filter((p) => getTotalStock(p) > 0);
}

export function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getVariationLabel(type: VariationType): string {
  return type === "cor" ? "Cor" : "Tamanho";
}
