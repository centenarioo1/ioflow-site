import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await getUsuarioLogado();
    if (!usuario) {
      return NextResponse.json({ erro: "Faça login para responder." }, { status: 401 });
    }

    const { id: topicoId } = await params;
    const { conteudo, imagens } = await req.json();

    if (!conteudo?.trim() || conteudo.length > 5000) {
      return NextResponse.json({ erro: "Resposta obrigatória (máx. 5000 caracteres)." }, { status: 400 });
    }

    const topicoExiste = await prisma.topico.findUnique({ where: { id: topicoId } });
    if (!topicoExiste) {
      return NextResponse.json({ erro: "Tópico não existe." }, { status: 404 });
    }

    const respostaDb = await prisma.resposta.create({
      data: {
        conteudo: conteudo.trim(),
        imagens: imagens || [],
        topicoId,
        autorId: usuario.id,
      },
      include: { autor: { select: { id: true, nome: true } } },
    });

    const resposta = {
      ...respostaDb,
      autor: { id: respostaDb.autor.id, name: respostaDb.autor.nome },
    };

    return NextResponse.json({ resposta }, { status: 201 });
  } catch (error) {
    console.error("❌ ERRO NO POST respostas:", error);
    return NextResponse.json({ erro: "Erro ao enviar resposta." }, { status: 500 });
  }
}