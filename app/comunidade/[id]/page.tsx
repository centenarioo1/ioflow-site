'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, MessageSquare, Send } from 'lucide-react';

interface Autor { id: string; name: string | null }
interface Resposta { id: string; conteudo: string; criadoEm: string; autor: Autor }
interface Topico {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  criadoEm: string;
  autor: Autor;
  respostas: Resposta[];
}

export default function TopicoPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [topico, setTopico] = useState<Topico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState<Autor | null>(null);

  const [resposta, setResposta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroResposta, setErroResposta] = useState('');

  const carregarTopico = useCallback(() => {
    if (!id) return;
    setCarregando(true);
    setErro('');
    fetch(`/api/forum/topicos/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro na requisição');
        return res.json();
      })
      .then((data) => setTopico(data.topico))
      .catch(() => setErro('Não foi possível carregar o tópico.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregarTopico();
  }, [carregarTopico]);

  useEffect(() => {
    fetch('/api/forum/me')
      .then((r) => r.json())
      .then((d) => setUsuarioLogado(d.usuario || null))
      .catch(() => setUsuarioLogado(null));
  }, []);

  async function enviarResposta(e: React.FormEvent) {
    e.preventDefault();
    setErroResposta('');
    if (!resposta.trim()) {
      setErroResposta('Escreva uma resposta antes de enviar.');
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`/api/forum/topicos/${id}/respostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: resposta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao enviar resposta.');
      setResposta('');
      setTopico((prev) =>
        prev ? { ...prev, respostas: [...prev.respostas, data.resposta] } : prev
      );
    } catch (err) {
      setErroResposta(err instanceof Error ? err.message : 'Erro ao enviar resposta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/comunidade"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar à comunidade
        </Link>

        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : erro || !topico ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-sm mb-3">{erro || 'Tópico não encontrado.'}</p>
            <button
              onClick={carregarTopico}
              className="text-emerald-700 text-sm font-semibold hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* Tópico */}
            <article className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm mb-8">
              <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full mb-3">
                {topico.categoria}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{topico.titulo}</h1>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                por <span className="font-medium text-gray-600">{topico.autor?.name || 'Anônimo'}</span>
                {' · '}
                {new Date(topico.criadoEm).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {topico.conteudo}
              </p>
            </article>

            {/* Respostas */}
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              {topico.respostas.length}{' '}
              {topico.respostas.length === 1 ? 'resposta' : 'respostas'}
            </h2>

            {topico.respostas.length === 0 ? (
              <p className="text-gray-400 text-sm mb-8">
                Nenhuma resposta ainda. Seja o primeiro a responder!
              </p>
            ) : (
              <div className="space-y-3 mb-8">
                {topico.respostas.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                  >
                    <p className="text-xs text-gray-400 mb-2">
                      <span className="font-medium text-emerald-700">
                        {r.autor?.name || 'Anônimo'}
                      </span>
                      {' · '}
                      {new Date(r.criadoEm).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{r.conteudo}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário de resposta */}
            {usuarioLogado ? (
              <form
                onSubmit={enviarResposta}
                className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm"
              >
                <textarea
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={4}
                  maxLength={5000}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                />
                {erroResposta && <p className="text-red-600 text-xs mt-2">{erroResposta}</p>}
                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Responder
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 text-center bg-white border border-gray-100 rounded-xl p-5">
                <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                  Faça login
                </Link>{' '}
                para responder este tópico.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}