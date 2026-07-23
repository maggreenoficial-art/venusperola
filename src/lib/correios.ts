export const correiosConfig = {
  originCep: process.env.CORREIOS_ORIGIN_CEP ?? "79541204",
  originCity: "Coxim",
  originState: "MS",
  apiBase:
    process.env.CORREIOS_API_BASE ??
    (process.env.CORREIOS_USE_HOMOLOG === "true"
      ? "https://apihom.correios.com.br"
      : "https://api.correios.com.br"),
  user: process.env.CORREIOS_USER ?? "",
  apiPassword: process.env.CORREIOS_API_PASSWORD ?? "",
  services: {
    pac: {
      code: process.env.CORREIOS_PAC_CODE ?? "04510",
      name: "PAC",
      label: "PAC — Econômico",
    },
    sedex: {
      code: process.env.CORREIOS_SEDEX_CODE ?? "04014",
      name: "SEDEX",
      label: "SEDEX — Mais rápido",
    },
  },
  defaultItemWeightKg: 0.25,
  minPackageWeightKg: 0.3,
  maxPackageWeightKg: 30,
  package: {
    length: 20,
    height: 8,
    width: 15,
  },
  requestTimeoutMs: Number(process.env.CORREIOS_TIMEOUT_MS ?? "12000"),
} as const;

export type ShippingServiceId = "pac" | "sedex";

export interface PackageDimensions {
  weightKg: number;
  length: number;
  height: number;
  width: number;
}

export interface ShippingQuote {
  service: ShippingServiceId;
  code: string;
  name: string;
  label: string;
  price: number;
  deliveryDays: number;
  error?: string;
}

interface CorreiosTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: CorreiosTokenCache | null = null;

function extractXmlTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function parseBrazilianMoney(value: string): number {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function serviceIdFromCode(code: string): ShippingServiceId | null {
  const { pac, sedex } = correiosConfig.services;
  if (code === pac.code || code === "03298") return "pac";
  if (code === sedex.code || code === "03220") return "sedex";
  return null;
}

export function estimatePackage(itemCount: number): PackageDimensions {
  const count = Math.max(1, itemCount);
  const weightKg = Math.min(
    correiosConfig.maxPackageWeightKg,
    Math.max(
      correiosConfig.minPackageWeightKg,
      count * correiosConfig.defaultItemWeightKg
    )
  );

  const extraHeight = Math.min(20, Math.max(0, (count - 1) * 2));

  return {
    weightKg,
    length: correiosConfig.package.length,
    width: correiosConfig.package.width,
    height: correiosConfig.package.height + extraHeight,
  };
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = correiosConfig.requestTimeoutMs
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function hasApiCredentials(): boolean {
  return Boolean(correiosConfig.user && correiosConfig.apiPassword);
}

async function getCorreiosToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 30 * 60 * 1000) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(
    `${correiosConfig.user}:${correiosConfig.apiPassword}`
  ).toString("base64");

  const res = await fetchWithTimeout(
    `${correiosConfig.apiBase}/token/v1/autentica`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Falha na autenticação Correios (${res.status}).`);
  }

  const data = (await res.json()) as {
    token?: string;
    expiraEm?: string;
  };

  if (!data.token) {
    throw new Error("Token dos Correios não retornado.");
  }

  const expiresAt = data.expiraEm
    ? new Date(data.expiraEm).getTime()
    : Date.now() + 23 * 60 * 60 * 1000;

  tokenCache = { token: data.token, expiresAt };
  return data.token;
}

interface PrecoResponse {
  coProduto?: string;
  pcFinal?: string;
  pcProduto?: string;
  txErro?: string;
}

interface PrazoResponse {
  coProduto?: string;
  prazoEntrega?: number;
  txErro?: string;
}

async function fetchCorreiosQuotesRest(
  destinationCep: string,
  pkg: PackageDimensions
): Promise<ShippingQuote[]> {
  const token = await getCorreiosToken();
  const origin = correiosConfig.originCep.replace(/\D/g, "");
  const destination = destinationCep.replace(/\D/g, "");
  const weightGrams = Math.max(300, Math.round(pkg.weightKg * 1000));

  const serviceList: Array<{
    id: ShippingServiceId;
    code: string;
  }> = [
    { id: "pac", code: correiosConfig.services.pac.code },
    { id: "sedex", code: correiosConfig.services.sedex.code },
  ];

  const precoBody = {
    idLote: "vp-frete",
    parametrosProduto: serviceList.map((svc, index) => ({
      coProduto: svc.code,
      nuRequisicao: String(index + 1),
      cepOrigem: origin,
      cepDestino: destination,
      psObjeto: String(weightGrams),
      tpObjeto: "2",
      comprimento: String(pkg.length),
      largura: String(pkg.width),
      altura: String(pkg.height),
    })),
  };

  const prazoBody = {
    idLote: "vp-prazo",
    parametrosPrazo: serviceList.map((svc, index) => ({
      coProduto: svc.code,
      nuRequisicao: String(index + 1),
      cepOrigem: origin,
      cepDestino: destination,
    })),
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const [precoRes, prazoRes] = await Promise.all([
    fetchWithTimeout(`${correiosConfig.apiBase}/preco/v1/nacional`, {
      method: "POST",
      headers,
      body: JSON.stringify(precoBody),
    }),
    fetchWithTimeout(`${correiosConfig.apiBase}/prazo/v1/nacional`, {
      method: "POST",
      headers,
      body: JSON.stringify(prazoBody),
    }),
  ]);

  if (!precoRes.ok) {
    throw new Error(`API Preço Correios indisponível (${precoRes.status}).`);
  }
  if (!prazoRes.ok) {
    throw new Error(`API Prazo Correios indisponível (${prazoRes.status}).`);
  }

  const precoData = (await precoRes.json()) as PrecoResponse[];
  const prazoData = (await prazoRes.json()) as PrazoResponse[];

  const precoByCode = new Map(
    precoData.map((item) => [item.coProduto ?? "", item])
  );
  const prazoByCode = new Map(
    prazoData.map((item) => [item.coProduto ?? "", item])
  );

  const quotes: ShippingQuote[] = [];

  for (const svc of serviceList) {
    const config = correiosConfig.services[svc.id];
    const preco = precoByCode.get(svc.code);
    const prazo = prazoByCode.get(svc.code);

    if (preco?.txErro) {
      quotes.push({
        service: svc.id,
        code: svc.code,
        name: config.name,
        label: config.label,
        price: 0,
        deliveryDays: 0,
        error: preco.txErro,
      });
      continue;
    }

    const price = parseBrazilianMoney(
      preco?.pcFinal ?? preco?.pcProduto ?? "0"
    );

    quotes.push({
      service: svc.id,
      code: svc.code,
      name: config.name,
      label: config.label,
      price,
      deliveryDays: prazo?.prazoEntrega ?? 0,
      error: price <= 0 ? "Preço indisponível para este CEP." : undefined,
    });
  }

  return quotes.sort((a, b) => a.price - b.price);
}

async function fetchCorreiosQuotesLegacy(
  destinationCep: string,
  pkg: PackageDimensions
): Promise<ShippingQuote[]> {
  const origin = correiosConfig.originCep.replace(/\D/g, "");
  const destination = destinationCep.replace(/\D/g, "");

  const serviceCodes = [
    correiosConfig.services.pac.code,
    correiosConfig.services.sedex.code,
  ].join(",");

  const params = new URLSearchParams({
    nCdEmpresa: "",
    sDsSenha: "",
    nCdServico: serviceCodes,
    sCepOrigem: origin,
    sCepDestino: destination,
    nVlPeso: String(pkg.weightKg),
    nCdFormato: "1",
    nVlComprimento: String(pkg.length),
    nVlAltura: String(pkg.height),
    nVlLargura: String(pkg.width),
    nVlDiametro: "0",
    sCdMaoPropria: "n",
    nVlValorDeclarado: "0",
    sCdAvisoRecebimento: "n",
    nIndicaCalculo: "3",
    StrRetorno: "xml",
  });

  const url = `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params}`;

  const res = await fetchWithTimeout(
    url,
    {
      headers: { Accept: "application/xml, text/xml, */*" },
      cache: "no-store",
    },
    8000
  );

  if (!res.ok) {
    throw new Error("Correios legado indisponível.");
  }

  const xml = await res.text();
  return parseCorreiosResponse(xml);
}

function parseCorreiosResponse(xml: string): ShippingQuote[] {
  const blocks = xml.match(/<cServico>[\s\S]*?<\/cServico>/gi) ?? [];
  const quotes: ShippingQuote[] = [];

  for (const block of blocks) {
    const code = extractXmlTag(block, "Codigo");
    const serviceId = serviceIdFromCode(code);
    if (!serviceId) continue;

    const errorCode = extractXmlTag(block, "Erro");
    const errorMsg = extractXmlTag(block, "MsgErro");
    const config = correiosConfig.services[serviceId];

    if (errorCode && errorCode !== "0") {
      quotes.push({
        service: serviceId,
        code,
        name: config.name,
        label: config.label,
        price: 0,
        deliveryDays: 0,
        error: errorMsg || "Serviço indisponível para este CEP.",
      });
      continue;
    }

    const price = parseBrazilianMoney(extractXmlTag(block, "Valor"));
    const deliveryDays =
      parseInt(extractXmlTag(block, "PrazoEntrega"), 10) || 0;

    quotes.push({
      service: serviceId,
      code,
      name: config.name,
      label: config.label,
      price,
      deliveryDays,
      error: price <= 0 ? "Preço indisponível para este CEP." : undefined,
    });
  }

  return quotes.sort((a, b) => a.price - b.price);
}

export async function fetchCorreiosQuotes(
  destinationCep: string,
  pkg: PackageDimensions
): Promise<ShippingQuote[]> {
  const origin = correiosConfig.originCep.replace(/\D/g, "");
  const destination = destinationCep.replace(/\D/g, "");

  if (origin.length !== 8 || destination.length !== 8) {
    throw new Error("CEP inválido.");
  }

  if (hasApiCredentials()) {
    return fetchCorreiosQuotesRest(destinationCep, pkg);
  }

  return fetchCorreiosQuotesLegacy(destinationCep, pkg);
}

export function getFallbackQuotes(subtotal: number): ShippingQuote[] {
  const base = subtotal >= 150 ? 0 : 19.9;
  return [
    {
      service: "pac",
      code: correiosConfig.services.pac.code,
      name: "PAC",
      label: "PAC — Econômico (estimativa)",
      price: base,
      deliveryDays: 10,
    },
    {
      service: "sedex",
      code: correiosConfig.services.sedex.code,
      name: "SEDEX",
      label: "SEDEX — Mais rápido (estimativa)",
      price: Math.round(base * 1.6 * 100) / 100,
      deliveryDays: 5,
    },
  ];
}
