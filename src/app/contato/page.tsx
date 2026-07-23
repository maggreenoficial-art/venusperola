import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com a ${brand.name}. Atendimento leve, elegante e com total discrição.`,
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 sm:pb-24">
      <p className="text-center text-xs tracking-[0.3em] text-accent uppercase">
        Clube Vênus
      </p>
      <h1 className="mt-3 text-center font-serif text-2xl italic">
        Estamos aqui para você
      </h1>
      <p className="mb-12 mt-4 text-center text-sm text-muted">
        Tire dúvidas com leveza e elegância. Sua privacidade é sagrada — nunca
        compartilhamos seus dados.
      </p>

      <form className="flex flex-col gap-6">
        <div>
          <label htmlFor="nome" className="mb-2 block text-xs tracking-widest text-muted uppercase">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            className="w-full border-b border-white/20 bg-transparent py-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-xs tracking-widest text-muted uppercase">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="w-full border-b border-white/20 bg-transparent py-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="mensagem" className="mb-2 block text-xs tracking-widest text-muted uppercase">
            Mensagem
          </label>
          <textarea
            id="mensagem"
            rows={5}
            className="w-full resize-none border-b border-white/20 bg-transparent py-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="mt-4 rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-accent"
        >
          Enviar mensagem
        </button>
      </form>

      <div className="mt-16 border-t border-white/10 pt-12 text-center">
        <p className="text-sm text-muted">Atendimento</p>
        <p className="mt-2 text-sm">contato@venusperola.com.br</p>
        <p className="mt-1 text-sm">WhatsApp: (11) 99999-9999</p>
      </div>
    </div>
  );
}
