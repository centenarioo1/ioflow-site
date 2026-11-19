// app/carrinho/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { 
  ShoppingBag, Trash2, ArrowLeft, ShieldCheck, Tag, Check, Truck, 
  MapPin, Loader2, CreditCard, QrCode, Copy, CheckCircle2, Lock, Gift, MessageSquare
} from 'lucide-react';
import { temFreteGratisPorValor } from '@/lib/frete';

const fmt = (v?: number | null) => {
  if (v === undefined || v === null || isNaN(v)) return 'R$ 0,00';
  return `R$ ${v.toFixed(2).replace('.', ',')}`;
};

const BRINDES_OPCOES = [
  { id: 'brinde-substrato-rico', nomeBase: 'Substrato Rico Bioflow', descricao: 'Nutrição completa e aeração ideal' },
  { id: 'brinde-super-solo', nomeBase: 'Super Solo Vivo Bioflow', descricao: 'Orgânico pronto e super ativado' },
  { id: 'brinde-coco-perlita', nomeBase: 'Fibra de Coco & Perlita', descricao: 'Drenagem máxima e leveza' },
];

export default function CarrinhoPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);
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
  const [observacoes, setObservacoes] = useState('');

  // Brinde Escolhido
  const [brindeEscolhido, setBrindeEscolhido] = useState<string>('brinde-substrato-rico');

  // Cupom
  const [cupomInput, setCupomInput] = useState('');
  const [aplicandoCupom, setAplicandoCupom] = useState(false);
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; desconto: number; freteGratis?: boolean } | null>(null);
  const [cupomErro, setCupomErro] = useState('');

  // Frete
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [freteOpcoes, setFreteOpcoes] = useState<{ id: string; nome: string; valor: number; prazo: number }[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<{ id: string; nome: string; valor: number } | null>(null);
  const [freteErro, setFreteErro] = useState('');

  // Pagamento
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao'>('pix');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [erroCheckout, setErroCheckout] = useState('');

  // Resultado Pix
  const [pixResultado, setPixResultado] = useState<{ qrCode: string; qrCodeBase64: string; orderId: string } | null>(null);
  const [copiadoPix, setCopiadoPix] = useState(false);

  // Campos do formulário
  const [numCartao, setNumCartao] = useState('');
  const [titular, setTitular] = useState('');
  const [validade, setValidade] = useState('');
  const [codigoSeg, setCodigoSeg] = useState('');
  const [parcelas, setParcelas] = useState(1);

  useEffect(() => {
    setIsMounted(true);

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
      } catch (e) {
        console.warn('Erro ao ler sessão local:', e);
      }
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
      } catch (e) {
        console.warn('Erro ao ler endereço salvo:', e);
      }
    }
  }, []);

  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="animate-spin" color="#15803d" />
      </div>
    );
  }

  // CÁLCULO DE VALORES
  const subtotal = items.reduce((acc, it) => acc + ((it.preco || (it as any).price || 0) * it.quantity), 0);
  const valorDesconto = cupomAplicado ? cupomAplicado.desconto : 0;
  const subtotalLiquido = Math.max(0, subtotal - valorDesconto);

  // FRETE GRÁTIS DE R$ 129,00
  const freteGratisPorValor = temFreteGratisPorValor(subtotalLiquido);
  const possuiFreteGratis = freteGratisPorValor || !!cupomAplicado?.freteGratis;

  const isOpcaoGratis = (opcaoId: string) => {
    if (cupomAplicado?.freteGratis) return true;
    if (freteGratisPorValor && freteOpcoes.length > 0 && freteOpcoes[0].id === opcaoId) return true;
    return false;
  };

  const isFreteSelecionadoGratis = freteSelecionado ? isOpcaoGratis(freteSelecionado.id) : false;

  const valorFrete = freteSelecionado ? (isFreteSelecionadoGratis ? 0 : freteSelecionado.valor) : 0;

  const total = Math.max(0, subtotalLiquido + valorFrete);

  // CÁLCULO DINÂMICO DE LITROS
  const totalLitrosSubstrato = items.reduce((acc, item) => {
    const sizeStr = String(item.variacao || item.size || '').toUpperCase();
    const nameStr = String(item.nome || item.name || '').toUpperCase();
    const match = sizeStr.match(/(\d+)\s*L/i) || sizeStr.match(/(\d+)\s*LITRO/i) || nameStr.match(/(\d+)\s*L/i);
    let litrosUnidade = match ? parseInt(match[1], 10) : 0;

    if (litrosUnidade === 0) {
      if (sizeStr.includes('50')) litrosUnidade = 50;
      else if (sizeStr.includes('20')) litrosUnidade = 20;
      else if (sizeStr.includes('10')) litrosUnidade = 10;
      else if (sizeStr.includes('5')) litrosUnidade = 5;
    }

    const qtd = Number(item.quantity || 1);
    return acc + (litrosUnidade * qtd);
  }, 0);

  const fatorBrinde = Math.max(1, Math.floor(totalLitrosSubstrato / 20));
  const litrosBrindeTotal = fatorBrinde * 5;

  const temDireitoABrinde = cupomAplicado?.codigo?.trim().toUpperCase() === 'BIOMAIS5';

  const handleCalcularFrete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFreteErro('');
    setFreteOpcoes([]);
    setFreteSelecionado(null);

    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setFreteErro('Por favor, insira um CEP válido de 8 dígitos.');
      return;
    }

    setCalculandoFrete(true);

    try {
      const viacepHost = 'viacep.com.br';
      const viaCepRes = await fetch(`https://${viacepHost}/ws/${cepLimpo}/json/`);
      const viaCepData = await viaCepRes.json();
      if (!viaCepData.erro) {
        setRua(viaCepData.logradouro || '');
        setBairro(viaCepData.bairro || '');
        setCidade(viaCepData.localidade || '');
        setEstado(viaCepData.uf || '');
      }
    } catch (err) {
      console.warn('Erro ao consultar CEP:', err);
    }

    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cepLimpo, itens: items }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao calcular frete.');
      }

      const opcoesCalculadas = data.opcoes || [];
      setFreteOpcoes(opcoesCalculadas);
      
      if (opcoesCalculadas.length > 0) {
        const primeiraOpcao = opcoesCalculadas[0];
        if (primeiraOpcao) {
          setFreteSelecionado({
            id: primeiraOpcao.id || '1',
            nome: primeiraOpcao.nome,
            valor: primeiraOpcao.valor,
          });
        }
      } else {
        setFreteErro('Nenhuma opção de frete disponível para este CEP.');
      }
    } catch (err: any) {
      setFreteErro(err.message || 'Erro ao calcular frete.');
    } finally {
      setCalculandoFrete(false);
    }
  };

  const handleAplicarCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCupomErro('');
    setCupomAplicado(null);

    const cdg = cupomInput.toUpperCase().trim();
    if (!cdg) return;

    setAplicandoCupom(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cdg, subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cupom inválido.');
      }

      setCupomAplicado({
        codigo: data.codigo || cdg,
        desconto: Number(data.desconto || 0),
        freteGratis: !!data.freteGratis || cdg === 'FRETEGRATIS',
      });
    } catch (err: any) {
      setCupomErro(err.message || 'Cupom inválido ou expirado.');
    } finally {
      setAplicandoCupom(false);
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
      const mappedItemsPayload = items.map(it => ({
        id: it.productId || it.variantId || it.id,
        name: it.nome || it.name,
        price: Number(it.preco || it.price || 0),
        quantity: Number(it.quantity),
        size: it.variacao || it.size || 'Padrão',
        image: it.imagem || it.image || '',
      }));

      if (temDireitoABrinde) {
        const brindeObj = BRINDES_OPCOES.find(b => b.id === brindeEscolhido) || BRINDES_OPCOES[0];
        mappedItemsPayload.push({
          id: `${brindeObj.id}-${litrosBrindeTotal}l`,
          name: `+${litrosBrindeTotal}L ${brindeObj.nomeBase}`,
          price: 0,
          quantity: 1,
          size: `+${litrosBrindeTotal} LITROS BRINDE`,
          image: '/products/substrato.jpg',
        });
      }

      const checkoutPayload = {
        items: mappedItemsPayload,
        paymentMethodId: metodoPagamento,
        installments: metodoPagamento === 'cartao' ? parcelas : 1,
        userId: userData.id || null,
        userEmail: userData.email,
        userName: userData.nome,
        userPhone: userData.telefone || '',
        userCpf: userData.cpf || '',
        cupomCodigo: cupomAplicado?.codigo || null,
        observacoes: observacoes.trim() || null,
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
        throw new Error(data.error || 'Erro ao processar pagamento.');
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
      console.error('Erro no checkout:', err);
      setErroCheckout(err.message || 'Ocorreu um erro ao processar seu pedido.');
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
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Link href="/produtos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar às Compras
          </Link>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={15} /> Ambiente e Checkout 100% Seguros
          </span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, color: '#0d2410' }}>
          Meu Carrinho & Checkout
        </h1>

        <div style={{ background: possuiFreteGratis ? '#dcfce7' : '#fef3c7', border: possuiFreteGratis ? '1px solid #86efac' : '1px solid #fde68a', color: possuiFreteGratis ? '#166534' : '#92400e', padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck size={18} />
          {isFreteSelecionadoGratis ? (
            <span>Parabéns! Seu pedido ganhou <strong>FRETE GRÁTIS</strong>!</span>
          ) : (
            <span>Faltam <strong>{fmt(129.0 - subtotalLiquido)}</strong> para você ganhar <strong>FRETE GRÁTIS</strong>!</span>
          )}
        </div>

        {erroCheckout && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
            {erroCheckout}
          </div>
        )}

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
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

              {temDireitoABrinde && (
                <div style={{ background: '#f0fdf4', border: '1.5px dashed #16a34a', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Gift size={18} color="#16a34a" />
                    <h3 style={{ fontSize: 13.5, fontWeight: 900, color: '#15803d', margin: 0 }}>
                      Cupom BIOMAIS5 Ativo! Você ganhou +{litrosBrindeTotal}L de Substrato Grátis!
                    </h3>
                  </div>
                  <p style={{ fontSize: 11.5, color: '#166534', margin: '0 0 10px' }}>
                    Acúmulo de +5L a cada 20L no carrinho ({totalLitrosSubstrato}L detectados). Escolha 1 tipo para receber seus +{litrosBrindeTotal}L:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {BRINDES_OPCOES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBrindeEscolhido(b.id)}
                        style={{
                          background: brindeEscolhido === b.id ? '#ffffff' : 'transparent',
                          border: brindeEscolhido === b.id ? '2px solid #15803d' : '1px solid #bbf7d0',
                          borderRadius: 8,
                          padding: '8px 10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: brindeEscolhido === b.id ? '#15803d' : '#1f2937' }}>
                            +{litrosBrindeTotal}L {b.nomeBase}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#6b7280' }}>
                            {b.descricao}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: brindeEscolhido === b.id ? '#15803d' : '#9ca3af' }}>
                          {brindeEscolhido === b.id ? '✓ Selecionado' : 'Selecionar'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: 'white', border: '1px solid #e7e2d6', borderRadius: 20, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: '#0d2410' }}>
                  <Truck size={16} color="#15803d" /> Opções de Entrega (Melhor Envio - 4 Mais Baratas)
                </h3>
                <form onSubmit={handleCalcularFrete} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input 
                    type="text" 
                    placeholder="Digite seu CEP" 
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                  />
                  <button 
                    type="submit" 
                    disabled={calculandoFrete}
                    style={{ background: '#0d2410', color: 'white', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    {calculandoFrete ? <Loader2 size={14} className="animate-spin" /> : 'Calcular'}
                  </button>
                </form>

                {freteErro && <p style={{ fontSize: 12, color: '#b91c1c', marginTop: 8, fontWeight: 600 }}>{freteErro}</p>}
                
                {freteOpcoes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {freteOpcoes.map((opcao) => (
                      <label 
                        key={opcao.nome} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          background: freteSelecionado?.nome === opcao.nome ? '#f0fdf4' : '#f9fafb',
                          border: freteSelecionado?.nome === opcao.nome ? '2px solid #15803d' : '1px solid #e5e7eb',
                          padding: '10px 12px', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          fontSize: 12.5,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input 
                            type="radio" 
                            name="opcaoFrete" 
                            checked={freteSelecionado?.id === opcao.id || freteSelecionado?.nome === opcao.nome}
                            onChange={() => setFreteSelecionado({ id: opcao.id, nome: opcao.nome, valor: opcao.valor })}
                            style={{ accentColor: '#15803d' }}
                          />
                          <div>
                            <span style={{ fontWeight: 700, color: '#111827' }}>{opcao.nome}</span>
                            <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>Prazo: {opcao.prazo} dias úteis</p>
                          </div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#15803d' }}>
                          {isOpcaoGratis(opcao.id) ? 'Grátis' : fmt(opcao.valor)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, color: '#0d2410', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="#15803d" /> Endereço Completo de Entrega
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

                  <div style={{ gridColumn: 'span 2', marginTop: 4 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <MessageSquare size={14} color="#15803d" /> Observações para Entrega / Pedido (Opcional)
                    </label>
                    <textarea 
                      value={observacoes} 
                      onChange={e => setObservacoes(e.target.value)} 
                      placeholder="Ex: Deixar com o porteiro..." 
                      style={{ width: '100%', height: 60, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12.5, fontFamily: 'inherit', resize: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid #e7e2d6', borderRadius: 20, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: '#0d2410' }}>
                  <Tag size={16} color="#15803d" /> Cupom de Desconto
                </h3>
                <form onSubmit={handleAplicarCupom} style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    placeholder="Digite seu cupom (Ex: BIOMAIS5 ou FRETEGRATIS)" 
                    value={cupomInput}
                    onChange={(e) => setCupomInput(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', textTransform: 'uppercase' }}
                  />
                  <button 
                    type="submit" 
                    disabled={aplicandoCupom}
                    style={{ background: '#0d2410', color: 'white', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    {aplicandoCupom ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                  </button>
                </form>
                {cupomErro && <p style={{ fontSize: 12, color: '#b91c1c', marginTop: 8, fontWeight: 600 }}>{cupomErro}</p>}
                {cupomAplicado && (
                  <p style={{ fontSize: 12, color: '#15803d', marginTop: 8, fontWeight: 700 }}>
                    ✓ Cupom {cupomAplicado.codigo} aplicado com sucesso! {cupomAplicado.freteGratis ? '(Frete Grátis Ativado)' : ''}
                  </p>
                )}
              </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
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
                    <QrCode size={18} /> Pix (Instantâneo)
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
                        <input type="text" value={numCartao} onChange={e => setNumCartao(e.target.value)} placeholder="Dados do cartão" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Titular do Cartão *</label>
                        <input type="text" value={titular} onChange={e => setTitular(e.target.value)} placeholder="NOME COMO NO CARTÃO" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>Validade *</label>
                          <input type="text" value={validade} onChange={e => setValidade(e.target.value)} placeholder="MM/AA" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 800, color: '#4b5563', display: 'block', marginBottom: 4 }}>CVV *</label>
                          <input type="text" value={codigoSeg} onChange={e => setCodigoSeg(e.target.value)} placeholder="123" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
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

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                      <span>Subtotal:</span>
                      <span>{fmt(subtotal)}</span>
                    </div>

                    {valorDesconto > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#15803d', fontWeight: 700, marginBottom: 6 }}>
                        <span>Desconto Cupom ({cupomAplicado?.codigo}):</span>
                        <span>- {fmt(valorDesconto)}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                      <span>Frete ({freteSelecionado?.nome || 'A calcular'}):</span>
                      <span>
                        {isFreteSelecionadoGratis ? (
                          <strong style={{ color: '#15803d' }}>
                            Grátis {freteGratisPorValor ? '(Promoção R$ 129)' : `(Cupom ${cupomAplicado?.codigo})`}
                          </strong>
                        ) : valorFrete > 0 ? (
                          fmt(valorFrete)
                        ) : (
                          freteSelecionado ? 'Grátis' : 'A calcular'
                        )}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, color: '#0d2410', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                      <span>Total:</span>
                      <span style={{ color: '#15803d' }}>{fmt(total)}</span>
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
