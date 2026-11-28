import { Resend } from 'resend';

interface ItemPedido {
  nome: string;
  quantidade: number;
  preco: number;
  variacao?: string;
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

interface DadosEmailAdmin {
  numeroPedido: string;
  nomeCliente: string;
  emailCliente: string;
  telefoneCliente?: string;
  cpfCliente?: string;
  itens: ItemPedido[];
  valorTotal: number;
  metodoPagamento: string;
  enderecoEntrega: string;
  cupomCodigo?: string;
  observacoes?: string;
}

interface DadosEmailBoasVindas {
  emailCliente: string;
  nomeCliente: string;
}

interface DadosEmailRedefinicao {
  emailCliente: string;
  nomeCliente: string;
  resetLink: string;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [Email Service] RESEND_API_KEY não configurada nas variáveis de ambiente.');
    return null;
  }
  return new Resend(apiKey);
}

const getRemetente = () => process.env.EMAIL_REMETENTE || 'Bioflow Orgânicos <vendas@biofloworganicos.com.br>';

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
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; color: #132e13; font-weight: 600;">
            ${item.nome} ${item.variacao ? `<br/><small style="color: #6b7280;">(${item.variacao})</small>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; text-align: center; color: #6b7280;">${item.quantidade}x</td>
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; text-align: right; color: #132e13; font-weight: 700;">
            ${item.preco === 0 ? '<span style="color: #16a34a;">GRÁTIS</span>' : `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`}
          </td>
        </tr>
      `
      )
      .join('');

    const enderecoHtml = enderecoEntrega
      ? `<p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;"><strong>Endereço de Entrega:</strong><br />${enderecoEntrega}</p>`
      : '';

    const pixHtml = codigoPix
      ? `
        <div style="background-color: #fefce8; border: 1px dashed #ca8a04; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #854d0e; font-weight: 700; font-size: 14px;">🔑 Código PIX Copia e Cola:</p>
          <textarea readonly style="width: 100%; height: 55px; font-family: monospace; font-size: 11px; padding: 8px; border: 1px solid #eab308; border-radius: 6px; background-color: #ffffff; resize: none; color: #1f2937;">${codigoPix}</textarea>
          <p style="margin: 8px 0 0; color: #a16207; font-size: 12px;">Copie o código acima e pague no aplicativo do seu banco para liberarmos o envio rapidamente!</p>
        </div>
      `
      : '';

    const urlBotao = linkPagamento || 'https://biofloworganicos.com.br/dashboard';
    const textoBotao = codigoPix ? 'Já Paguei / Ver Pedido' : 'Pagar com Cartão / Ver Pedido';

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f4ee; padding: 30px 10px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e2d6; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <div style="background-color: #0d2410; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
              BIOFLOW<span style="color: #d4a843;">.</span>
            </h1>
            <p style="color: #facc15; font-size: 13px; margin: 6px 0 0; font-weight: 700;">
              Recebemos o seu pedido! 🛍️
            </p>
          </div>

          <div style="padding: 30px 24px;">
            <h2 style="color: #0d2410; font-size: 18px; margin-top: 0;">Olá, ${nomeCliente}! 🌱</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              Muito obrigado por escolher a <strong>Bioflow Orgânicos</strong>! Seu pedido <strong>#${numeroPedido}</strong> foi registrado com sucesso e estamos aguardando a confirmação do pagamento para iniciar o preparo.
            </p>

            ${pixHtml}

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

          <div style="background-color: #faf8f5; padding: 16px; text-align: center; border-top: 1px solid #e7e2d6; font-size: 11px; color: #9ca3af;">
            <p style="margin: 0;">BIOFLOW Orgânicos — Nutrição Organomineral de Precisão</p>
          </div>

        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: getRemetente(),
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
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; color: #132e13; font-weight: 600;">
            ${item.nome} ${item.variacao ? `<br/><small style="color: #6b7280;">(${item.variacao})</small>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; text-align: center; color: #6b7280;">${item.quantidade}x</td>
          <td style="padding: 10px; border-bottom: 1px solid #e7e2d6; text-align: right; color: #132e13; font-weight: 700;">
            ${item.preco === 0 ? '<span style="color: #16a34a;">GRÁTIS</span>' : `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`}
          </td>
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
          
          <div style="background-color: #0d2410; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
              BIOFLOW<span style="color: #d4a843;">.</span>
            </h1>
            <p style="color: #4ade80; font-size: 13px; margin: 6px 0 0; font-weight: 700;">
              Pagamento Confirmado! 🌿
            </p>
          </div>

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
              <a href="https://biofloworganicos.com.br/dashboard" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13px; display: inline-block;">
                Acompanhar Status no Painel
              </a>
            </div>
          </div>

          <div style="background-color: #faf8f5; padding: 16px; text-align: center; border-top: 1px solid #e7e2d6; font-size: 11px; color: #9ca3af;">
            <p style="margin: 0;">BIOFLOW Orgânicos — Nutrição Organomineral de Precisão</p>
          </div>

        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: getRemetente(),
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

/**
 * 🟢 E-MAIL 3: Alerta completo enviado ao ADMIN quando um novo pedido é registrado/aprovado
 */
export async function enviarEmailAdminNovoPedido(dados: DadosEmailAdmin) {
  try {
    const resend = getResendClient();
    if (!resend) return { ok: false, error: 'RESEND_API_KEY ausente' };

    const emailAdminDestino = process.env.ADMIN_EMAIL || 'vendas@biofloworganicos.com.br';

    const itensHtml = dados.itens
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
            <strong>${item.nome}</strong> ${item.variacao ? `<br/><small style="color:#6b7280;">Variação: ${item.variacao}</small>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${item.quantidade}x</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #1f2937;">
            ${item.preco === 0 ? '<span style="color: #16a34a;">BRINDE GRÁTIS</span>' : `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 24px 10px; color: #18181b;">
        <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 28px; border: 1px solid #e4e4e7; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <div style="background-color: #0d2410; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 0.5px;">
              🛒 NOVO PEDIDO RECEBIDO #${dados.numeroPedido}
            </h2>
            <p style="color: #4ade80; margin: 6px 0 0; font-size: 13px; font-weight: 700;">
              Notificação de Venda - Bioflow Orgânicos
            </p>
          </div>

          <h3 style="color: #15803d; font-size: 15px; border-bottom: 2px solid #dcfce7; padding-bottom: 6px; margin-top: 0;">👤 Dados do Cliente:</h3>
          <p style="font-size: 13.5px; line-height: 1.6; color: #3f3f46; margin-bottom: 20px;">
            <strong>Nome:</strong> ${dados.nomeCliente}<br/>
            <strong>E-mail:</strong> ${dados.emailCliente}<br/>
            <strong>Telefone:</strong> ${dados.telefoneCliente || 'Não informado'}<br/>
            <strong>CPF:</strong> ${dados.cpfCliente || 'Não informado'}
          </p>

          <h3 style="color: #15803d; font-size: 15px; border-bottom: 2px solid #dcfce7; padding-bottom: 6px;">📍 Endereço de Entrega:</h3>
          <p style="font-size: 13px; background: #fafafa; padding: 14px; border-radius: 10px; border: 1px solid #e4e4e7; color: #3f3f46; margin-bottom: 20px;">
            ${dados.enderecoEntrega}
          </p>

          ${dados.observacoes ? `
            <div style="background-color: #fefce8; border: 1px dashed #ca8a04; padding: 14px; border-radius: 10px; margin-bottom: 20px;">
              <strong style="color: #854d0e; font-size: 13.5px;">📝 Observações do Cliente:</strong>
              <p style="margin: 6px 0 0; font-size: 13px; color: #713f12; line-height: 1.4;">${dados.observacoes}</p>
            </div>
          ` : ''}

          <h3 style="color: #15803d; font-size: 15px; border-bottom: 2px solid #dcfce7; padding-bottom: 6px;">📦 Itens do Pedido para Separação:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f4f4f5; color: #27272a; text-align: left;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px; text-align: center;">Qtd</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itensHtml}
            </tbody>
          </table>

          <div style="background-color: #f4f4f5; padding: 16px; border-radius: 12px; font-size: 14px; color: #27272a;">
            <div style="margin-bottom: 6px;"><strong>Forma de Pagamento:</strong> ${dados.metodoPagamento}</div>
            ${dados.cupomCodigo ? `<div style="margin-bottom: 6px;"><strong>Cupom Usado:</strong> <span style="color:#15803d; font-weight:700;">${dados.cupomCodigo}</span></div>` : ''}
            <div style="font-size: 17px; font-weight: 900; color: #15803d; margin-top: 8px; border-top: 1px solid #e4e4e7; padding-top: 8px;">
              Valor Total do Pedido: R$ ${dados.valorTotal.toFixed(2).replace('.', ',')}
            </div>
          </div>

        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: getRemetente(),
      to: [emailAdminDestino],
      subject: `🚨 [NOVO PEDIDO] #${dados.numeroPedido} - R$ ${dados.valorTotal.toFixed(2).replace('.', ',')} (${dados.nomeCliente})`,
      html: htmlTemplate,
    });

    console.log('✅ [Email Service] E-mail do Admin enviado:', response);
    return { ok: true, data: response };
  } catch (err: any) {
    console.error('❌ [Email Service] Erro ao enviar e-mail ao Admin:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * 🟢 E-MAIL 4: Enviado no cadastro do usuário (Boas-Vindas)
 */
export async function enviarEmailBoasVindas(dados: DadosEmailBoasVindas) {
  try {
    const resend = getResendClient();
    if (!resend) return { ok: false, error: 'RESEND_API_KEY ausente' };

    const { emailCliente, nomeCliente } = dados;

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f4ee; padding: 30px 10px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e2d6; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <div style="background-color: #0d2410; padding: 28px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">
              BIOFLOW<span style="color: #d4a843;">.</span>
            </h1>
            <p style="color: #4ade80; font-size: 13.5px; margin: 8px 0 0; font-weight: 700;">
              Seja muito bem-vindo à nossa comunidade! 🌿
            </p>
          </div>

          <div style="padding: 32px 28px;">
            <h2 style="color: #0d2410; font-size: 19px; margin-top: 0;">Olá, ${nomeCliente}! 🌱</h2>
            <p style="color: #4b5563; font-size: 14.5px; line-height: 1.6;">
              É um imenso prazer ter você conosco! Sua conta na <strong>Bioflow Produtos Orgânicos</strong> foi criada com sucesso.
            </p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 6px; color: #166534; font-weight: 800; font-size: 15px;">💚 Seu Cupom Especial de Boas-Vindas:</p>
              <div style="display: inline-block; background-color: #ffffff; border: 2px dashed #16a34a; padding: 8px 20px; border-radius: 8px; color: #15803d; font-weight: 900; font-size: 18px; letter-spacing: 1px; margin-top: 4px;">
                BIOFLOW15
              </div>
              <p style="margin: 8px 0 0; color: #15803d; font-size: 12.5px;">Aproveite 15% OFF em sua primeira compra no site!</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://biofloworganicos.com.br/produtos" style="background-color: #15803d; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block;">
                Explorar Catálogo de Produtos
              </a>
            </div>
          </div>

          <div style="background-color: #faf8f5; padding: 18px; text-align: center; border-top: 1px solid #e7e2d6; font-size: 11.5px; color: #9ca3af;">
            <p style="margin: 0;">BIOFLOW Orgânicos — Nutrição Organomineral de Precisão</p>
          </div>

        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: getRemetente(),
      to: [emailCliente],
      subject: `🌱 Bem-vindo à Bioflow Orgânicos, ${nomeCliente}!`,
      html: htmlTemplate,
    });

    console.log('✅ [Email Service] E-mail de boas-vindas enviado:', response);
    return { ok: true, data: response };
  } catch (error: any) {
    console.error('❌ [Email Service] Erro ao enviar e-mail de boas-vindas:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * 🟢 E-MAIL 5: Enviado para Redefinição de Senha
 */
export async function enviarEmailRedefinicaoSenha(dados: DadosEmailRedefinicao) {
  try {
    const resend = getResendClient();
    if (!resend) return { ok: false, error: 'RESEND_API_KEY ausente' };

    const { emailCliente, nomeCliente, resetLink } = dados;

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f4ee; padding: 30px 10px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e2d6;">
          <div style="background-color: #0d2410; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;">BIOFLOW<span style="color: #d4a843;">.</span></h1>
            <p style="color: #facc15; font-size: 13px; margin: 6px 0 0; font-weight: 700;">Solicitação de Redefinição de Senha 🔐</p>
          </div>
          <div style="padding: 30px 24px;">
            <h2 style="color: #0d2410; font-size: 18px; margin-top: 0;">Olá, ${nomeCliente}!</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Recebemos uma solicitação para redefinir a senha da sua conta na Bioflow Orgânicos.</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="background-color: #15803d; color: #ffffff; padding: 13px 26px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13.5px; display: inline-block;">
                Redefinir Minha Senha
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">Se você não solicitou, por favor ignore este e-mail.</p>
          </div>
        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: getRemetente(),
      to: [emailCliente],
      subject: `🔐 Redefinição de Senha - Bioflow Orgânicos`,
      html: htmlTemplate,
    });

    console.log('✅ [Email Service] E-mail de redefinição enviado:', response);
    return { ok: true, data: response };
  } catch (error: any) {
    console.error('❌ [Email Service] Erro ao enviar e-mail de redefinição:', error);
    return { ok: false, error: error.message };
  }
}
