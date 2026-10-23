import { NextResponse } from "next/server";
import { getUsuarioLogado } from "@/lib/auth";

export async function GET() {
  try {
    const usuario = await getUsuarioLogado();
    return NextResponse.json({
      usuario: usuario ? { id: usuario.id, name: usuario.name } : null,
    });
  } catch {
    return NextResponse.json({ usuario: null });
  }
}