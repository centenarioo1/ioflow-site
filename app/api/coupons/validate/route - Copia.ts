// app/api/coupons/validate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Polimorfismo de Payload: Aceita qualquer variação de chave de cupom enviada pelo frontend [1]
    const codigoBruto = body.codigo || body.code || body.coupon || body.couponCode || body.cupom || "";
    const codigoFormatado = codigoBruto.toString().toUpperCase().trim();

    // 2. Polimorfismo de Subtotal: Captura o valor do carrinho enviado de qualquer forma [1]
    const subtotalBruto = body.subtotal || body.total || body.value || body.amount || 0;
    const subtotal = Number(subtotalBruto);

    console.log("[Validador de Cupom] Tentando aplicar: " + codigoFormatado + " para um subtotal de R$ " + subtotal.toFixed(2));

    if (!codigoFormatado) {
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Codigo do cupom nao foi fornecido."
      }, { status: 400 });
    }

    // 3. Busca o cupom no banco de dados [1]
    const cupom = await prisma.cupom.findUnique({
      where: { codigo: codigoFormatado },
    });

    if (!cupom) {
      console.warn("[Validador de Cupom] Cupom nao encontrado: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Cupom invalido."
      }, { status: 404 });
    }

    // 4. Validação de Status (Ativo) [1]
    if (!cupom.ativo) {
      console.warn("[Validador de Cupom] Cupom inativo: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Este cupom esta inativo no momento."
      }, { status: 400 });
    }

    // 5. Validação de Expiração [1]
    const expirado = cupom.dataExpiracao ? new Date() > new Date(cupom.dataExpiracao) : false;
    if (expirado) {
      console.warn("[Validador de Cupom] Cupom expirado: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Este cupom ja esta expirado."
      }, { status: 400 });
    }

    // 6. Validação de Valor Mínimo [1]
    if (cupom.valorMinimo && subtotal < cupom.valorMinimo) {
      console.warn("[Validador de Cupom] Subtotal inferior ao minimo: " + subtotal + " < " + cupom.valorMinimo);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "O valor minimo para usar este cupom e R$ " + cupom.valorMinimo.toFixed(2).replace(".", ",") + "."
      }, { status: 400 });
    }

    // 7. Validação de Limite de Usos [1]
    if (cupom.limiteTotal && cupom.usoTotal >= cupom.limiteTotal) {
      console.warn("[Validador de Cupom] Limite de usos atingido para: " + codigoFormatado);
      return NextResponse.json({
        success: false,
        ok: false,
        error: "Este cupom atingiu o limite de utilizacoes."
      }, { status: 400 });
    }

    // 8. Cálculo de Desconto (Percentual vs. Fixo) [1]
    const tipo = (cupom.tipo || "").toLowerCase();
    const ehPercentual = tipo === "percentual" || tipo === "porcentagem";

    let valorDesconto = ehPercentual
      ? (subtotal * cupom.valor) / 100
      : cupom.valor;

    // Garante que o desconto nunca seja maior do que a própria compra [1]
    valorDesconto = Math.min(valorDesconto, subtotal);

    console.log("[Validador de Cupom] Cupom aplicado com sucesso! Desconto de R$ " + valorDesconto.toFixed(2));

    // 9. Duplo Retorno: Devolve chaves tanto em PT quanto em EN para blindagem total do seu frontend [1]
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
      value: cupom.valor
    });

  } catch (error: any) {
    console.error("[Validador de Cupom] Erro critico:", error);
    return NextResponse.json({
      success: false,
      ok: false,
      error: "Erro interno no servidor ao processar cupom."
    }, { status: 500 });
  }
}