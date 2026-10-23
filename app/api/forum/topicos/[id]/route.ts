import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const topicoDb = await prisma.topico.findUnique({
      where: { id },
      include: {
        autor: { select: { id: true, nome: true } },
        respostas: {
          orderBy: { criadoEm: "asc" },
          include: {
            autor: { select: { id: true, nome: true } },
          },
        },
      },
    });

    if (!topicoDb) {
      return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
    }

    const topico = {
      ...topicoDb,
      autor: { id: topicoDb.autor.id, name: topicoDb.autor.nome },
      // @ts-ignore: Forçando o Vercel a ignorar validações estritas no map
      respostas: topicoDb.respostas.map((r: any) => ({
        ...r,
        autor: { id: r.autor.id, name: r.autor.nome },
      })),
    };

    return NextResponse.json({ topico });
  } catch (error) {
    console.error("❌ ERRO NO GET /api/forum/topicos/[id]:", error);
    return NextResponse.json({ erro: "Falha ao carregar tópico." }, { status: 500 });
  }
}