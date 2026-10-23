import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const categoria = req.nextUrl.searchParams.get("categoria");

    const topicosDb = await prisma.topico.findMany({
      where: categoria && categoria !== "Todas" ? { categoria } : undefined,
      orderBy: { criadoEm: "desc" },
      include: {
        autor: { select: { id: true, nome: true } },
        _count: { select: { respostas: true } },
      },
    });

    const topicos = topicosDb.map((t) => ({
      ...t,
      autor: { id: t.autor.id, name: t.autor.nome },
    }));

    return NextResponse.json({ topicos });
  } catch (error) {
    console.error("❌ ERRO NO GET /api/forum/topicos:", error);
    return NextResponse.json({ erro: "Falha ao listar tópicos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioLogado();
    if (!usuario) {
      return NextResponse.json({ erro: "Faça login para criar um tópico." }, { status: 401 });
    }

    const { titulo, conteudo, categoria, imagens } = await req.json();

    if (!titulo?.trim() || titulo.length > 150) {
      return NextResponse.json({ erro: "Título obrigatório (máx. 150 caracteres)." }, { status: 400 });
    }
    if (!conteudo?.trim() || conteudo.length > 10000) {
      return NextResponse.json({ erro: "Conteúdo obrigatório (máx. 10000 caracteres)." }, { status: 400 });
    }

    const topicoDb = await prisma.topico.create({
      data: {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        categoria: categoria || "Cultivo",
        imagens: imagens || [],
        autorId: usuario.id,
      },
      include: {
        autor: { select: { id: true, nome: true } },
        _count: { select: { respostas: true } },
      },
    });

    const topico = { ...topicoDb, autor: { id: topicoDb.autor.id, name: topicoDb.autor.nome } };
    return NextResponse.json({ topico }, { status: 201 });
  } catch (error) {
    console.error("❌ ERRO NO POST /api/forum/topicos:", error);
    return NextResponse.json({ erro: "Erro ao criar tópico." }, { status: 500 });
  }
}