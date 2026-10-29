// app/carrinho/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { 
  ShoppingBag, Trash2, ArrowLeft, ShieldCheck, Tag, Check, Truck, 
  MapPin, Loader2, CreditCard, QrCode, Copy, CheckCircle2, Lock
} from 'lucide-react';

export default function CarrinhoPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState({ id: '', nome: '', email: '', cpf: '', telefone: '' });

  // Endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [complemento, setComplemento] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  // Cupom
  const [cupomInput, setCupomInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; valor: number; tipo: string } | null>(null);
  const [erroCupom, setErroCupom] = useState('');
  const [loadingCupom, setLoadingCupom] = useState(false);

  // Frete
  const [valorFrete, setValorFrete] = useState(0);
  const [freteSelecionado, setFreteSelecionado] = useState<{ nome: string; valor: number } | null>(null);

  // Forma de Pagamento Transparente
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao'>('pix');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [erroCheckout, setErroCheckout] = useState('');

  // Resultado do Pix gerado na tela
  const [pixResultado, setPixResultado] = useState<{ qrCode: string; qrCodeBase64: string; orderId: string } | null>(null);
  const [copiadoPix, setCopiadoPix] = useState(false);

  // Dados do Cartão de Crédito
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [valocidadeCartao, setValocidadeCartao] = useState('');
  const [cvvCartao, setCvvCartao] = useState('');
  const [parcelas, setParcelas] = useState(1);

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const u = JSON.parse(session);
        setIsLogged(true);
        setUserData({
          id: u.id || '',
          nome: u.nome || u.name || '',
          email: u.email || '',
          cpf: u.cpf || '',
          telefone: u.telefone || '',
        });
      } catch {}
    }

    const addr = localStorage.getItem('user_address');
    if (addr) {
      try {
        const a = JSON.parse(addr);
        setCep(a.cep || '');
        setRua(a.rua || '');
        setNumero(a.numero || '');
        setBairro(a.bairro || '');
        setCidade(a.cidade || '');
        setEstado(a.estado || '');
        setComplemento(a.complemento || '');
      } catch {}
    }
  }, []);

  const subtotal = items.reduce((acc, item) => acc + (item.price || item.preco || 0) * item.quantity, 0);

  let valorDesconto = 0;
  if (cupomAplicado) {
    if (cupomAplicado.tipo.toLowerCase().includes('percent')) {
      valorDesconto = (subtotal * cupomAplicado.valor) / 100;
    } else {
      valorDesconto = cupomAplicado.valor;
    }
    valorDesconto = Math.min(valorDesconto, subtotal);
  }

  const total = Math.max(0, subtotal - valorDesconto + valorFrete);

  const buscarCep = async (cepDigitado: string) => {
    setCep(cepDigitado);
    const cleanCep = cepDigitado.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRua(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
          setValorFrete(19.90);
          setFreteSelecionado({ nome: 'Entrega Padrão (Melhor Envio)', valor: 19.90 });
        }
      } catch {} finally {
        setLoadingCep(false);
      }
    }
  };

  const aplicarCupom = async () => {
    if (!cupomInput.trim()) return;
    setLoadingCupom(true);
    setErroCupom('');
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cupomInput.toUpperCase().trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCupomAplicado({ codigo: data.cupom.codigo, valor: data.cupom.valor, tipo: data.cupom.tipo });
      } else {
        setErroCupom(data.error || 'Cupom inválido ou expirado.');
      }
    } catch {
      setErroCupom('Erro ao validar cupom.');
    } finally {
      setLoadingCupom(false);
    }
  };

  const handleProcessarPagamentoTransparente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroCheckout('');

    if (!isLogged) {
      router.push('/login?redirect=/carrinho');
      return;
    }

    if (!rua || !numero || !bairro || !cidade || !estado || !cep) {
      setErroCheckout('Por favor, preencha o endereço completo de entrega.');
      return;
    }

    setLoadingCheckout(true);
    try {
      const checkoutPayload = {
        items: items.map(it => ({
          id: it.productId || it.variantId || it.id,
          name: it.nome || it.name,
          price: Number(it.preco || it.price || 0),
          quantity: Number(it.quantity),
          size: it.variacao || it.size || 'Padrão',
          image: it.imagem || it.image || '',
        })),
        paymentMethodId: metodoPagamento,
        installments: metodoPagamento === 'cartao' ? parcelas : 1,
        userId: userData.id || null,
        userEmail: userData.email,
        userName: userData.nome,
        userPhone: userData.telefone || '11999999999',
        userCpf: userData.cpf || '00000000000',
        cupomCodigo: cupomAplicado?.codigo || null,
        shippingCost: valorFrete,
        shippingServiceName: freteSelecionado?.nome || 'Padrão',
        address: { cep: cep.replace(/\D/g, ''), rua, numero, complemento, bairro, cidade, estado }
      };

      const res = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar o pagamento transparente.');
      }

      clearCart();

      if (metodoPagamento === 'pix' && data.pix?.qrCode) {
        setPixResultado({
          qrCode: data.pix.qrCode,
          qrCodeBase64: data.pix.qrCodeBase64,
          orderId: data.orderId
        });
      } else {
        router.push(`/dashboard?pedido=${data.orderId}&status=${data.status}`);
      }

    } catch (err: any) {
      console.error('Erro no checkout transparente:', err);
      setErroCheckout(err.message || 'Ocorreu um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const copiarChavePix = () => {
    if (pixResultado?.qrCode) {
      navigator.clipboard.writeText(pixResultado.qrCode);
      setCopiadoPix(true);
      setTimeout(() => setCopiadoPix(false), 3000);
    }
  };

  if (items.length === 0 && !pixResultado) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f4ee', padding: '60px 20px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <ShoppingBag size={56} color="#15803d" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Seu carrinho está vazio</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Adicione adubos e fertilizantes orgânicos para continuar.</p>
        <Link href="/produtos" style={{ background: '#15803d', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 800, fontSize: 14 }}>
          Ver Catálogo Bioflow
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', color: '#111827', fontFamily: "'Inter', sans-serif", padding: '30px 20px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* Topo do Carrinho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Link href="/produtos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar às Compras
          </Link>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={15} /> Ambientes e Checkout 100% Protegidos
          </span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, color: '#0d2410' }}>
          Checkout Transparente BIOFLOW
        </h1>

        {erroCheckout && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
            {erroCheckout}
          </div>
        )}

        {/* TELA DE SUCESSO PIX */}
        {pixResultado ? (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 32, textAlign: 'center', maxWidth: 550, margin: '0 auto' }}>
            <CheckCircle2 size={56} color="#15803d" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0d2410', margin: '0 0 8px' }}>Pedido Gerado com Sucesso!</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
              Escaneie o QR Code ou copie a chave Pix para concluir o pagamento no seu banco.
            </p>

            {pixResultado.qrCodeBase64 && (
              <img 
                src={`data:image/png;base64,${pixResultado.qrCodeBase64}`} 
                alt="QR Code Pix" 
                style={{ width: 180, height: 180, margin: '0 auto 20px', borderRadius: 12, border: '1px solid #e5e7eb', padding: 8 }} 
              />
            )}

            <div style={{ marginBottom: 24 }}>
              <button 
                onClick={copiarChavePix}
                style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 10, padding: '12px 20px', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}
              >
                {copiadoPix ? <Check size={18} /> : <Copy size={18} />}
                {copiadoPix ? 'Chave Pix Copiada!' : 'Copiar Chave Pix (Copia e Cola)'}
              </button>
            </div>

            <Link href={`/dashboard?pedido=${pixResultado.orderId}`} style={{ background: '#0d2410', color: 'white', textDecoration: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 800, fontSize: 13, display: 'block' }}>
              Ir para o Meu Dashboard
            </Link>
          </div>
        ) : (
          /* ESTRUTURA DE 2 COLUNAS */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
            
            {/* COLUNA 1: PRODUTOS, ENDEREÇO E FRETE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* LISTA DE PRODUTOS COMPLETA COM MINIATURAS VISÍVEIS */}
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, color: '#0d2410', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingBag size={18} color="#15803d" /> Itens no Carrinho ({items.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {items.map(item => {
                    const itemPrice = item.price || item.preco || 0;
                    const itemImg = item.imagem || item.image || '/products/substrato.jpg';
                    const itemSize = item.variacao || item.size || 'Padrão';

                    return (
                      <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
                        <img 
                          src={itemImg} 
                          alt={item.nome || item.name} 
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>
                            {item.nome || item.name}
                          </h3>
                          <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 6px' }}>
                            Embalagem / Variação: <strong>{itemSize}</strong>
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
                              <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ padding: '2px 8px', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontWeight: 800 }}>-</button>
                              <span style={{ padding: '2px 10px', fontSize: 12, fontWeight: 800 }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '2px 8px', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontWeight: 800 }}>+</button>
                            </div>
                            <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 900, color: '#15803d' }}>
                          R$ {(itemPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FORMULÁRIO DE ENDEREÇO DE ENTREGA */}
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, color: '#0d2410', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="#15803d" /> Endereço de Entrega
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>CEP *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        type="text" 
                        value={cep} 
                        onChange={e => buscarCep(e.target.value)} 
                        placeholder="Ex: 16603-268" 
                        style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} 
                        required 
                      />
                      {loadingCep && <Loader2 size={20} className="animate-spin" color="#15803d" style={{ alignSelf: 'center' }} />}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Rua / Avenida *</label>
                    <input type="text" value={rua} onChange={e => setRua(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Número *</label>
                    <input type="text" value={numero} onChange={e => setNumero(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Complemento</label>
                    <input type="text" value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Ex: Apto 12" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Bairro *</label>
                    <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Cidade / UF *</label>
                    <input type="text" value={cidade ? `${cidade}/${estado}` : ''} onChange={e => setCidade(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>
                </div>
              </div>

            </div>

            {/* COLUNA 2: FORMA DE PAGAMENTO TRANSPARENTE E RESUMO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* SELETOR DE PAGAMENTO TRANSPARENTE */}
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, color: '#0d2410', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={18} color="#15803d" /> Escolha o Pagamento
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('pix')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: metodoPagamento === 'pix' ? '2px solid #15803d' : '1px solid #d1d5db',
                      background: metodoPagamento === 'pix' ? '#f0fdf4' : 'white',
                      color: metodoPagamento === 'pix' ? '#15803d' : '#4b5563',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <QrCode size={18} /> Pix (Aprovação Instantânea)
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('cartao')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: metodoPagamento === 'cartao' ? '2px solid #15803d' : '1px solid #d1d5db',
                      background: metodoPagamento === 'cartao' ? '#f0fdf4' : 'white',
                      color: metodoPagamento === 'cartao' ? '#15803d' : '#4b5563',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <CreditCard size={18} /> Cartão de Crédito
                  </button>
                </div>

                <form onSubmit={handleProcessarPagamentoTransparente}>
                  {metodoPagamento === 'pix' ? (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, marginBottom: 20, fontSize: 12.5, color: '#4b5563', lineHeight: 1.5 }}>
                      ⚡ O QR Code e a chave Pix serão gerados diretamente nesta tela para você pagar em segundos pelo app do seu banco.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Número do Cartão *</label>
                        <input type="text" value={numeroCartao} onChange={e => setNumeroCartao(e.target.value)} placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Nome como no Cartão *</label>
                        <input type="text" value={nomeCartao} onChange={e => setNomeCartao(e.target.value)} placeholder="NOME DO TITULAR" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Validade *</label>
                          <input type="text" value={valocidadeCartao} onChange={e => setValocidadeCartao(e.target.value)} placeholder="MM/AA" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>CVV *</label>
                          <input type="text" value={cvvCartao} onChange={e => setCvvCartao(e.target.value)} placeholder="123" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Parcelas</label>
                        <select value={parcelas} onChange={e => setParcelas(Number(e.target.value))} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, background: 'white', fontWeight: 700 }}>
                          <option value={1}>1x de R$ {total.toFixed(2)} (Sem juros)</option>
                          <option value={2}>2x de R$ {(total / 2).toFixed(2)} (Sem juros)</option>
                          <option value={3}>3x de R$ {(total / 3).toFixed(2)} (Sem juros)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* RESUMO FINANCEIRO */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                      <span>Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>

                    {valorDesconto > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#15803d', fontWeight: 700, marginBottom: 6 }}>
                        <span>Desconto Cupom ({cupomAplicado?.codigo}):</span>
                        <span>- R$ {valorDesconto.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                      <span>Frete ({freteSelecionado?.nome || 'A calcular'}):</span>
                      <span>{valorFrete > 0 ? `R$ ${valorFrete.toFixed(2).replace('.', ',')}` : 'Grátis'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, color: '#0d2410', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                      <span>Total:</span>
                      <span style={{ color: '#15803d' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingCheckout}
                    style={{
                      width: '100%',
                      background: '#15803d',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
                    }}
                  >
                    {loadingCheckout ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Processando Pagamento...
                      </>
                    ) : (
                      <>
                        Finalizar Pedido com {metodoPagamento === 'pix' ? 'Pix' : 'Cartão'}
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
