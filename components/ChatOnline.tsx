"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Usuario = { id: string; name: string | null };
type Mensagem = {
  id: string;
  conteudo: string;
  criadoEm: string;
  autor: { id: string; name: string | null };
};

export default function ChatOnline({ usuario }: { usuario: Usuario | null }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [online, setOnline] = useState<Usuario[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const ultimaData = useRef<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  // Busca mensagens novas (polling a cada 3s)
  useEffect(() => {
    let ativo = true;

    async function buscar() {
      const query = ultimaData.current
        ? `?depois=${encodeURIComponent(ultimaData.current)}`
        : "";
      try {
        const res = await fetch(`/api/forum/chat${query}`);
        const data = await res.json();
        if (!ativo) return;
        if (data.mensagens.length > 0) {
          setMensagens((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const novas = data.mensagens.filter((m: Mensagem) => !ids.has(m.id));
            return [...prev, ...novas];
          });
          ultimaData.current = data.mensagens[data.mensagens.length - 1].criadoEm;
        }
        setOnline(data.online);
      } catch {
        /* silencia erro de rede momentâneo */
      }
    }

    buscar();
    const intervalo = setInterval(buscar, 3000);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  // Heartbeat de presença a cada 15s (só se logado)
  useEffect(() => {
    if (!usuario) return;
    const bater = () => fetch("/api/forum/chat/presenca", { method: "POST" });
    bater();
    const intervalo = setInterval(bater, 15000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/forum/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: texto }),
      });
      if (res.ok) setTexto("");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* Área do chat */}
      <div className="flex flex-1 flex-col rounded-xl border">
        <div className="h-96 overflow-y-auto p-4">
          {mensagens.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Nenhuma mensagem ainda. Diga oi! 👋
            </p>
          ) : (
            mensagens.map((m) => {
              const minha = usuario && m.autor.id === usuario.id;
              return (
                <div key={m.id} className={`mb-3 flex ${minha ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      minha ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {!minha && (
                      <p className="text-xs font-semibold text-green-700">
                        {m.autor.name || "Cultivador"}
                      </p>
                    )}
                    <p>{m.conteudo}</p>
                    <p className={`mt-0.5 text-right text-[10px] ${minha ? "text-green-100" : "text-gray-400"}`}>
                      {new Date(m.criadoEm).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={fimRef} />
        </div>

        {/* Campo de envio */}
        {usuario ? (
          <form onSubmit={enviar} className="flex gap-2 border-t p-3">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={500}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg border p-2 text-sm"
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="rounded-lg bg-green-600 px-4 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        ) : (
          <p className="border-t p-3 text-center text-sm">
            <Link href="/login?redirect=/comunidade" className="font-semibold text-green-700 hover:underline">
              Faça login
            </Link>{" "}
            para conversar no chat. Você pode acompanhar a conversa como visitante. 👀
          </p>
        )}
      </div>

      {/* Lista de quem está online */}
      <aside className="w-full rounded-xl border p-4 md:w-56">
        <h3 className="mb-3 text-sm font-semibold">
          🟢 Online agora ({online.length})
        </h3>
        {online.length === 0 ? (
          <p className="text-sm text-gray-400">Ninguém online no momento.</p>
        ) : (
          <ul className="space-y-2">
            {online.map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {u.name || "Cultivador"}
                {usuario && u.id === usuario.id && (
                  <span className="text-xs text-gray-400">(você)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}