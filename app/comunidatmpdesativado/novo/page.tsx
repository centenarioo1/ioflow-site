"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS, MAX_IMAGENS } from "@/lib/forumConstants";

export default function NovoTopicoPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0]);
  const [imagens, setImagens] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [subindoImagem, setSubindoImagem] = useState(false);
  const [erro, setErro] = useState("");

  // Redireciona se não estiver logado
  useEffect(() => {
    fetch("/api/forum/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.usuario) router.push("/login?redirect=/comunidade/novo");
      });
  }, [router]);

  async function subirImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (imagens.length >= MAX_IMAGENS) {
      setErro(`Máximo de ${MAX_IMAGENS} imagens por tópico.`);
      return;
    }
    setErro("");
    setSubindoImagem(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const res = await fetch("/api/forum/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setImagens((prev) => [...prev, data.url]);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro no upload.");
    } finally {
      setSubindoImagem(false);
      e.target.value = "";
    }
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/forum/topicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, conteudo, categoria, imagens }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      router.push(`/comunidade/${data.topico.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao publicar.");
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">✍️ Novo Tópico</h1>

      <form onSubmit={publicar} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-lg border p-2"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={120}
            required
            placeholder="Ex: Folhas amarelando na 3ª semana de vega, o que pode ser?"
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Conteúdo</label>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            maxLength={5000}
            required
            rows={6}
            placeholder="Descreva sua dúvida ou tutorial com detalhes: substrato, iluminação, rega, fase do cultivo..."
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Fotos ({imagens.length}/{MAX_IMAGENS}) — máx. 5MB cada
          </label>
          <input type="file" accept="image/*" onChange={subirImagem} disabled={subindoImagem} />
          {subindoImagem && <p className="mt-1 text-sm text-gray-400">Enviando imagem...</p>}

          {imagens.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {imagens.map((url, i) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Imagem ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagens((prev) => prev.filter((u) => u !== url))}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={enviando || subindoImagem}
          className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {enviando ? "Publicando..." : "Publicar Tópico"}
        </button>
      </form>
    </main>
  );
}