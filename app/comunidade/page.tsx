'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Plus, Loader2, X, Users } from 'lucide-react';
import ChatOnline from '@/components/ChatOnline';

import { CATEGORIAS as CATS_FORUM } from '@/lib/forumConstants';
const CATEGORIAS = ['Todas', ...CATS_FORUM];

interface Autor { id: string; name: string | null }
interface Topico {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  criadoEm: string;
  autor: Autor;
  _count?: { respostas: number };
}

export default function ComunidadePage() {
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [usuarioLogado, setUsuarioLogado] = useState<Autor | null>(null);

  // Formulário de novo tópico
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [catNovo, setCatNovo] = useState('Cultivo');
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregarTopicos = useCallback(() => {
    setCarregando(true);
    setErro('');
    const query = categoria !== 'Todas' ? `?categoria=${encodeURIComponent(categoria)}` : '';
    fetch(`/api/forum/topicos${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro na requisição');
        return res.json();
      })
      .then((data) => setTopicos(data.topicos || []))
      .catch(() => setErro('Não foi possível carregar os tópicos. Tente novamente.'))
      .finally(() => setCarregando(false));
  }, [categoria]);

  useEffect(() => {
    carregarTopicos();
  }, [carregarTopicos]);

  useEffect(() => {
    fetch('/api/forum/me')
      .then((r) => r.json())
      .then((d) => setUsuarioLogado(d.usuario || null))
      .catch(() => setUsuarioLogado(null));
  }, []);

  async function criarTopico(e: React.FormEvent) {
    e.preventDefault();
    setErroForm('');
    if (!titulo.trim() || !conteudo.trim()) {
      setErroForm('Preencha o título e o conteúdo.');
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch('/api/forum/topicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, conteudo, categoria: catNovo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao criar tópico.');
      setTitulo('');
      setConteudo('');
      setMostrarForm(false);
      carregarTopicos();
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : 'Erro ao criar tópico.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" /> Comunidade Bioflow
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Fórum de Cultivo</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Compartilhe experiências, tire dúvidas e evolua seu cultivo com outros cultivadores.
          </p>
        </div>

        {/* Filtros + botão novo tópico */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                categoria === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          {usuarioLogado ? (
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              {mostrarForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {mostrarForm ? 'Cancelar' : 'Criar novo tópico'}
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                Faça login
              </Link>{' '}
              para criar tópicos e responder.
            </p>
          )}
        </div>

        {/* Formulário de novo tópico */}
        {mostrarForm && usuarioLogado && (
          <form
            onSubmit={criarTopico}
            className="bg-white border border-emerald-100 rounded-2xl p-5 mb-8 shadow-sm space-y-3"
          >
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do tópico"
              maxLength={150}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={catNovo}
              onChange={(e) => setCatNovo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIAS.filter((c) => c !== 'Todas').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Descreva sua dúvida ou experiência..."
              rows={4}
              maxLength={10000}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
            {erroForm && <p className="text-red-600 text-xs">{erroForm}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
              Publicar tópico
            </button>
          </form>
        )}

        {/* Lista de tópicos */}
        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : erro ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-sm mb-3">{erro}</p>
            <button
              onClick={carregarTopicos}
              className="text-emerald-700 text-sm font-semibold hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : topicos.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">
            Nenhum tópico nesta categoria ainda. Seja o primeiro a publicar!
          </p>
        ) : (
          <div className="space-y-3">
            {topicos.map((t) => (
              <Link
                key={t.id}
                href={`/comunidade/${t.id}`}
                className="block bg-white border border-gray-100 hover:border-emerald-300 rounded-2xl p-5 transition shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                      {t.categoria}
                    </span>
                    <h2 className="font-semibold text-gray-900 truncate">{t.titulo}</h2>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{t.conteudo}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      por <span className="font-medium text-gray-600">{t.autor?.name || 'Anônimo'}</span>
                      {' · '}
                      {new Date(t.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm shrink-0">
                    <MessageSquare className="w-4 h-4" />
                    {t._count?.respostas ?? 0}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ChatOnline usuario={usuarioLogado} />
    </main>
  );
}