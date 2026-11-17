// app/api/coupons/validate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CUPOM_BRINDE } from "@/lib/promocoes";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const codigoBruto = body.codigo || body.code || body.coupon || body.couponCode || body.cupom || "";
    const codigoFormatado = codigoBruto.toString().toUpperCase().trim();

    const subtotalBruto = body.subtotal || body.total || body.value || body.amount || 0;
    const subtotal = Number(subtotalBruto);

    console.log("[Validador de Cupom] Tentando aplicar: " + codigoFormatado + " para subtotal R\$ " + subtotal.toFixed(2));

    if (!codigoFormatado) {
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Código do cupom não foi fornecido."
      }, { status: 400 });
    }

    const cupom = await prisma.cupom.findUnique({
      where: { codigo: codigoFormatado },
    });

    if (!cupom) {
      console.warn("[Validador de Cupom] Cupom não encontrado: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Cupom inválido."
      }, { status: 404 });
    }

    if (!cupom.ativo) {
      console.warn("[Validador de Cupom] Cupom inativo: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Este cupom está inativo no momento."
      }, { status: 400 });
    }

    const expirado = cupom.dataExpiracao ? new Date() > new Date(cupom.dataExpiracao) : false;
    if (expirado) {
      console.warn("[Validador de Cupom] Cupom expirado: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Este cupom já está expirado."
      }, { status: 400 });
    }

    if (cupom.valorMinimo && subtotal < cupom.valorMinimo) {
      console.warn("[Validador de Cupom] Subtotal inferior ao mínimo: " + subtotal + " < " + cupom.valorMinimo);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "O valor mínimo para usar este cupom é R\$ " + cupom.valorMinimo.toFixed(2).replace(".", ",") + "."
      }, { status: 400 });
    }

    if (cupom.limiteTotal && cupom.usoTotal >= cupom.limiteTotal) {
      console.warn("[Validador de Cupom] Limite de usos atingido para: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Este cupom atingiu o limite de utilizações."
      }, { status: 400 });
    }

    const tipo = (cupom.tipo || "").toLowerCase();
    const ehPercentual = tipo === "percentual" || tipo === "porcentagem";
    const ehFreteGratis = tipo === "frete_gratis" || codigoFormatado === "FRETEGRATIS";

    let valorDesconto = ehPercentual
      ? (subtotal * cupom.valor) / 100
      : cupom.valor;

    if (ehFreteGratis) {
      valorDesconto = cupom.valor || 0;
    }

    // BIOMAIS5 é cupom de brinde (+5L a cada 20L): nunca dá desconto em dinheiro,
    // mesmo que a linha do cupom no banco tenha algum valor.
    const ehBrinde = codigoFormatado === CUPOM_BRINDE;
    if (ehBrinde) valorDesconto = 0;

    valorDesconto = Math.min(valorDesconto, subtotal);

    console.log("[Validador de Cupom] Aplicado com sucesso! Frete Grátis: " + ehFreteGratis + ", Desconto R\$ " + valorDesconto.toFixed(2));

    return NextResponse.json({
      success: true,
      ok: true,
      codigo: cupom.codigo,
      code: cupom.codigo,
      desconto: valorDesconto,
      discount: valorDesconto,
      tipo: cupom.tipo,
      type: cupom.tipo,
      valor: cupom.valor,
      value: cupom.valor,
      freteGratis: ehFreteGratis,
      brinde: ehBrinde,
    });

  } catch (error: any) {
    console.error("[Validador de Cupom] Erro crítico:", error);
    return NextResponse.json({
      success: false,
      ok: false,
      error: "Erro interno no servidor ao processar cupom."
    }, { status: 500 });
  }
}