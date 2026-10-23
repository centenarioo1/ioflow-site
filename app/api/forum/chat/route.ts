import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado } from "@/lib/auth";

const ONLINE_JANELA_SEGUNDOS = 30;

// GET /api/forum/chat?depois=...
export async function GET(req: NextRequest) {
  try {
    const depois = req.nextUrl.searchParams.get("depois");

    const mensagensDb = await prisma.chatMensagem.findMany({
      where: depois ? { criadoEm: { gt: new Date(depois) } } : undefined,
      orderBy: { criadoEm: "asc" },
      take: 100,
      include: { autor: { select: { id: true, nome: true } } },
    });

    const limite = new Date(Date.now() - ONLINE_JANELA_SEGUNDOS * 1000);
    const onlineDb = await prisma.presencaChat.findMany({
      where: { vistoEm: { gte: limite } },
      include: { usuario: { select: { id: true, nome: true } } },
    });

    return NextResponse.json({
      mensagens: mensagensDb.map((m) => ({
        ...m,
        autor: { id: m.autor.id, name: m.autor.nome },
      })),
      online: onlineDb.map((p) => ({ id: p.usuario.id, name: p.usuario.nome })),
    });
  } catch (error) {
    console.error("❌ ERRO NO GET /api/forum/chat:", error);
    return NextResponse.json({ mensagens: [], online: [] }, { status: 500 });
  }
}

// POST /api/forum/chat
export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioLogado();
    if (!usuario) {
      return NextResponse.json({ erro: "Faça login para conversar." }, { status: 401 });
    }

    const { conteudo } = await req.json();
    if (!conteudo?.trim() || conteudo.length > 500) {
      return NextResponse.json({ erro: "Mensagem inválida (máx. 500 caracteres)." }, { status: 400 });
    }

    const mensagemDb = await prisma.chatMensagem.create({
      data: { conteudo: conteudo.trim(), autorId: usuario.id },
      include: { autor: { select: { id: true, nome: true } } },
    });

    const mensagem = {
      ...mensagemDb,
      autor: { id: mensagemDb.autor.id, name: mensagemDb.autor.nome },
    };

    return NextResponse.json({ mensagem }, { status: 201 });
  } catch (error) {
    console.error("❌ ERRO NO POST /api/forum/chat:", error);
    return NextResponse.json({ erro: "Erro ao enviar mensagem." }, { status: 500 });
  }
}