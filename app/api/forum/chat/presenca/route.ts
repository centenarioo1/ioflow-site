import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado } from "@/lib/auth";

export async function POST() {
  const usuario = await getUsuarioLogado();
  if (!usuario) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  await prisma.presencaChat.upsert({
    where: { usuarioId: usuario.id },
    update: { vistoEm: new Date() },
    create: { usuarioId: usuario.id },
  });

  return NextResponse.json({ ok: true });
}