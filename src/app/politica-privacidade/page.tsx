import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 sm:pb-24">
      <h1 className="mb-8 text-center text-sm font-bold tracking-[0.25em]">
        POLÍTICA DE PRIVACIDADE
      </h1>
      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          A OUTBELLE BRASIL respeita sua privacidade. Todas as informações
          coletadas são utilizadas exclusivamente para processamento de pedidos
          e comunicação relacionada à sua compra.
        </p>
        <p>
          Garantimos embalagem 100% discreta, sem identificação do conteúdo ou
          da loja na parte externa da encomenda.
        </p>
        <p>
          Seus dados não são compartilhados com terceiros, exceto quando
          necessário para entrega (transportadoras) ou processamento de
          pagamento.
        </p>
      </div>
    </div>
  );
}
