// lib/email.ts
import { Resend } from 'resend';

interface ItemPedido {
  nome: string;
  quantidade: number;
  preco: number;
}

interface DadosEmailPedido {
  emailCliente: string;
  nomeCliente: string;
  numeroPedido: string;
  itens: ItemPedido[];
  valorTotal: number;
  metodoPagamento: string;
  enderecoEntrega?: string;
}

// 🟢 Instanciação Preguiçosa (Lazy Load): Evita que o build da Vercel quebre ao compilar
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [Email Service] RESEND_API_KEY não configurada nas variáveis de ambiente.');
    return null;
  }
  return new Resend(apiKey);
}

export async function enviarEmailConfirmacaoPedido(dados: DadosEmailPedido) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('⚠️ [Email Service] Abortando envio: RESEND_API_KEY não encontrada.');
      return { ok: false, error: 'RESEND_API_KEY não configurada' };
    }

    const { emailCliente, nomeCliente, numeroPedido, itens, valorTotal, metodoPagamento, enderecoEntrega } = dados;

    // 1. Monta as linhas da tabela de produtos em HTML
    const itensHtml = itens
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; color: #132e13; font-weight: 600;">${item.nome}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; text-align: center; color: #6b7280;">${item.quantidade}x</td>
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; text-align: right; color: #132e13; font-weight: 700;">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</td>
        </tr>
      `
      )
      .join('');

    // 2. Monta o HTML do endereço previamente
    const enderecoHtml = enderecoEntrega
      ? `<p style="font-size: 13px; color: #6b7280; margin-bottom: 20px;"><strong>Endereço de Entrega:</strong><br />${enderecoEntrega}</p>`
      : '';

    // 3. Template HTML principal do e-mail
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f4ee; padding: 30px 10px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e2d6; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <!-- CABEÇALHO -->
          <div style="background-color: #0d2410; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
              BIOFLOW<span style="color: #d4a843;">.</span>
            </h1>
            <p style="color: #4ade80; font-size: 13px; margin: 6px 0 0; font-weight: 700;">
              Pedido Confirmado com Sucesso!
            </p>
          </div>

          <!-- CORPO DO E-MAIL -->
          <div style="padding: 30px 24px;">
            <h2 style="color: #0d2410; font-size: 18px; margin-top: 0;">Olá, ${nomeCliente}! 🌱</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              Recebemos o seu pedido <strong>#${numeroPedido}</strong> e ele já está em nosso sistema aguardando os próximos passos de preparo e envio.
            </p>

            <!-- TABELA DE ITENS -->
            <div style="margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background-color: #f3efe6; color: #0d2410;">
                    <th style="padding: 10px; text-align: left;">Produto</th>
                    <th style="padding: 10px; text-align: center;">Qtd</th>
                    <th style="padding: 10px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itensHtml}
                </tbody>
              </table>
            </div>

            <!-- RESUMO DE VALORES -->
            <div style="background-color: #faf8f5; border-radius: 12px; padding: 16px; border: 1px solid #e7e2d6; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                <span style="color: #6b7280;">Forma de Pagamento:</span>
                <strong style="color: #0d2410;">${metodoPagamento.toUpperCase()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #15803d; border-top: 1px solid #e7e2d6; padding-top: 8px;">
                <span>Total do Pedido:</span>
                <span>R$ ${valorTotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            ${enderecoHtml}

            <div style="text-align: center; margin-top: 30px;">
              <a href="[suspicious link removed]" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13px; display: inline-block;">
                Acompanhar no Painel
              </a>
            </div>
          </div>

          <!-- RODAPÉ -->
          <div style="background-color: #faf8f5; padding: 16px; text-align: center; border-top: 1px solid #e7e2d6; font-size: 11px; color: #9ca3af;">
            <p style="margin: 0;">BIOFLOW Orgânicos — Nutrição Organomineral de Precisão</p>
          </div>

        </div>
      </div>
    `;

    const remetente = process.env.EMAIL_REMETENTE || 'Bioflow Orgânicos <onboarding@resend.dev>';

    const response = await resend.emails.send({
      from: remetente,
      to: [emailCliente],
      subject: `🌱 Pedido #${numeroPedido} Confirmado! - Bioflow Orgânicos`,
      html: htmlTemplate,
    });

    console.log('✅ [Email Service] E-mail de confirmação enviado:', response);
    return { ok: true, data: response };

  } catch (error: any) {
    console.error('❌ [Email Service] Erro ao enviar e-mail:', error);
    return { ok: false, error: error.message };
  }
}