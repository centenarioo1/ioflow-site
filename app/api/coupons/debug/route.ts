import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cupons = await prisma.cupom.findMany();
    return NextResponse.json({
      success: true,
      mensagem: "Conexao com o Prisma realizada com sucesso!",
      totalCuponsEncontrados: cupons.length,
      // CORREÇÃO: Adicionado (c: any) para evitar o erro de 'implicit any'
      cuponsQuePrismaConsegueVer: cupons.map((c: any) => ({
        codigo: c.codigo,
        ativo: c.ativo,
        valor: c.valor
      }))
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Erro ao conectar ao banco de dados",
      details: error.message
    }, { status: 500 });
  }
}