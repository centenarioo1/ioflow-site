// lib/email.ts
import { Resend } from 'resend';

interface ItemPedido {
  nome: string;
  quantidade: number;
  preco: number;
}

interface DadosEmailPedidoCriado {
  emailCliente: string;
  nomeCliente: string;
  numeroPedido: string;
  itens: ItemPedido[];
  valorTotal: number;
  metodoPagamento: string;
  codigoPix?: string;
  linkPagamento?: string;
  enderecoEntrega?: string;
}

interface DadosEmailConfirmacao {
  emailCliente: string;
  nomeCliente: string;
  numeroPedido: string;
  itens: ItemPedido[];
  valorTotal: number;
  metodoPagamento: string;
  enderecoEntrega?: string;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [Email Service] RESEND_API_KEY não configurada nas variáveis de ambiente.');
    return null;
  }
  return new Resend(apiKey);
}

/**
 * 🟢 E-MAIL 1: Enviado imediatamente no momento da compra (Aguardando Pagamento)
 */
export async function enviarEmailPedidoCriado(dados: DadosEmailPedidoCriado) {
  try {
    const resend = getResendClient();
    if (!resend) return { ok: false, error: 'RESEND_API_KEY ausente' };

    const {
      emailCliente,
      nomeCliente,
      numeroPedido,
      itens,
      valorTotal,
      metodoPagamento,
      codigoPix,
      linkPagamento,
      enderecoEntrega,
    } = dados;

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

    const enderecoHtml = enderecoEntrega
      ? `<p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;"><strong>Endereço de Entrega:</strong><br />${enderecoEntrega}</p>`
      : '';

    // Bloco especial para o PIX Copia e Cola
    const pixHtml = codigoPix
      ? `
        <div style="background-color: #fefce8; border: 1px dashed #ca8a04; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #854d0e; font-weight: 700; font-size: 14px;">🔑 Código PIX Copia e Cola:</p>
          <textarea readonly style="width: 100%; height: 55px; font-family: monospace; font-size: 11px; padding: 8px; border: 1px solid #eab308; border-radius: 6px; background-color: #ffffff; resize: none; color: #1f2937;">${codigoPix}</textarea>
          <p style="margin: 8px 0 0; color: #a16207; font-size: 12px;">Copie o código acima e pague no aplicativo do seu banco para liberarmos o envio rapidamente!</p>
        </div>
      `
      : '';

    const urlBotao = linkPagamento || '[suspicious link removed]';
    const textoBotao = codigoPix ? 'Já Paguei / Ver Pedido' : 'Pagar com Cartão / Ver Pedido';

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f4ee; padding: 30px 10px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e2d6; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <!-- CABEÇALHO -->
          <div style="background-color: #0d2410; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
              BIOFLOW<span style="color: #d4a843;">.</span>
            </h1>
            <p style="color: #facc15; font-size: 13px; margin: 6px 0 0; font-weight: 700;">
              Recebemos o seu pedido! 🛍️
            </p>
          </div>

          <!-- CORPO DO E-MAIL -->
          <div style="padding: 30px 24px;">
            <h2 style="color: #0d2410; font-size: 18px; margin-top: 0;">Olá, ${nomeCliente}! 🌱</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              Muito obrigado por escolher a <strong>Bioflow Orgânicos</strong>! Seu pedido <strong>#${numeroPedido}</strong> foi registrado com sucesso e estamos aguardando a confirmação do pagamento para iniciar o preparo.
            </p>

            ${pixHtml}

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

            <!-- RESUMO -->
            <div style="background-color: #faf8f5; border-radius: 12px; padding: 16px; border: 1px solid #e7e2d6; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                <span style="color: #6b7280;">Pagamento:</span>
                <strong style="color: #0d2410;">${metodoPagamento.toUpperCase()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #15803d; border-top: 1px solid #e7e2d6; padding-top: 8px;">
                <span>Total a Pagar:</span>
                <span>R$ ${valorTotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            ${enderecoHtml}

            <div style="text-align: center; margin-top: 24px;">
              <a href="${urlBotao}" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13px; display: inline-block;">
                ${textoBotao}
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

    const remetente = process.env.EMAIL_REMETENTE || 'Bioflow Orgânicos <vendas@biofloworganicos.com.br>';

    const response = await resend.emails.send({
      from: remetente,
      to: [emailCliente],
      subject: `📋 Pedido #${numeroPedido} Recebido! - Bioflow Orgânicos`,
      html: htmlTemplate,
    });

    console.log('✅ [Email Service] E-mail de pedido criado enviado:', response);
    return { ok: true, data: response };
  } catch (error: any) {
    console.error('❌ [Email Service] Erro ao enviar e-mail de criação:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * 🟢 E-MAIL 2: Enviado quando o pagamento é APROVADO
 */
export async function enviarEmailConfirmacaoPedido(dados: DadosEmailConfirmacao) {
  try {
    const resend = getResendClient();
    if (!resend) return { ok: false, error: 'RESEND_API_KEY ausente' };

    const { emailCliente, nomeCliente, numeroPedido, itens, valorTotal, metodoPagamento, enderecoEntrega } = dados;

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

    const enderecoHtml = enderecoEntrega
      ? `<p style="font-size: 13px; color: #6b7280; margin-bottom: 20px;"><strong>Endereço de Entrega:</strong><br />${enderecoEntrega}</p>`
      : '';

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f4ee; padding: 30px 10px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e2d6; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <!-- CABEÇALHO -->
          <div style="background-color: #0d2410; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
              BIOFLOW<span style="color: #d4a843;">.</span>
            </h1>
            <p style="color: #4ade80; font-size: 13px; margin: 6px 0 0; font-weight: 700;">
              Pagamento Confirmado! 🌿
            </p>
          </div>

          <!-- CORPO -->
          <div style="padding: 30px 24px;">
            <h2 style="color: #0d2410; font-size: 18px; margin-top: 0;">Excelente notícia, ${nomeCliente}! 🎉</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              Confirmamos o pagamento do seu pedido <strong>#${numeroPedido}</strong>! Nossa equipe já está separando os produtos com todo o carinho para envio.
            </p>

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

            <div style="background-color: #faf8f5; border-radius: 12px; padding: 16px; border: 1px solid #e7e2d6; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                <span style="color: #6b7280;">Forma de Pagamento:</span>
                <strong style="color: #0d2410;">${metodoPagamento.toUpperCase()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #15803d; border-top: 1px solid #e7e2d6; padding-top: 8px;">
                <span>Total Pago:</span>
                <span>R$ ${valorTotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            ${enderecoHtml}

            <div style="text-align: center; margin-top: 30px;">
              <a href="[suspicious link removed]" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13px; display: inline-block;">
                Acompanhar Status no Painel
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

    const remetente = process.env.EMAIL_REMETENTE || 'Bioflow Orgânicos <vendas@biofloworganicos.com.br>';

    const response = await resend.emails.send({
      from: remetente,
      to: [emailCliente],
      subject: `✅ Pagamento Confirmado! Pedido #${numeroPedido} - Bioflow Orgânicos`,
      html: htmlTemplate,
    });

    console.log('✅ [Email Service] E-mail de confirmação enviado:', response);
    return { ok: true, data: response };
  } catch (error: any) {
    console.error('❌ [Email Service] Erro ao enviar e-mail de confirmação:', error);
    return { ok: false, error: error.message };
  }
}