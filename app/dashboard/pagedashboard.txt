'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, Package, LogOut, ShoppingBag, CheckCircle2, Tag, CreditCard, 
  Clipboard, AlertCircle, User, MapPin, RefreshCw, Lock, Home, KeyRound
} from 'lucide-react';

interface UserOrder {
  id: string;
  orderNumber: string;
  items: { produtoId: string; nome: string; variacao?: string; preco: number; quantity: number }[];
  subtotal: number;
  frete: number;
  cupom?: string;
  desconto: number;
  total: number;
  status: string;
  trackingCode?: string;
  createdAt: string;
  mpPreferenceId?: string | null;
}

const STATUS_CORES: Record<string, { bg: string; cor: string }> = {
  Pendente: { bg: '#fef3c7', cor: '#92400e' },
  Aprovado: { bg: '#dcfce7', cor: '#166534' },
  Enviado: { bg: '#dbeafe', cor: '#1e40af' },
  Entregue: { bg: '#d1fae5', cor: '#065f46' },
  Cancelado: { bg: '#fee2e2', cor: '#991b1b' },
  Reembolsado: { bg: '#f3e8ff', cor: '#6b21a8' },
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Abas do Dashboard
  const [activeTab, setActiveTab] = useState<'pedidos' | 'dados' | 'enderecos' | 'trocas' | 'senha'>('pedidos');

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  // Dados do Comprador (Sincronizado)
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');

  // Dados do Endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [complemento, setComplemento] = useState('');

  // Formulário de Trocas
  const [pedidoTrocaId, setPedidoTrocaId] = useState('');
  const [motivoTroca, setMotivoTroca] = useState('');

  // Senhas
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  // Feedbacks de Sucesso e Erros locais
  const [sucessoMsg, setSucessoMsg] = useState('');
  const [erroMsg, setErroMsg] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [pixData, setPixData] = useState<Record<string, { qrCode: string; qrCodeBase64: string; loading: boolean }>>({});

  // 1. Carregamento dos dados iniciais
  useEffect(() => {
    // Sincroniza dados da sessão com a API do Google (se logado por lá)
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          const session = localStorage.getItem('user_session');
          let u = session ? JSON.parse(session) : {};
          localStorage.setItem('user_session', JSON.stringify({
            ...u,
            id: data.user.id,
            nome: data.user.nome,
            email: data.user.email,
            role: data.user.role
          }));
        }
      })
      .catch(() => {});

    // Carrega do LocalStorage
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const u = JSON.parse(session);
        setNome(u?.nome || u?.name || '');
        setEmail(u?.email || '');
        setTelefone(u?.telefone || '');
        setCpf(u?.cpf || '');
      } catch {}
    }

    const enderecoSalvo = localStorage.getItem('user_address');
    if (enderecoSalvo) {
      try {
        const addr = JSON.parse(enderecoSalvo);
        setCep(addr.cep || '');
        setRua(addr.rua || '');
        setNumero(addr.numero || '');
        setBairro(addr.bairro || '');
        setCidade(addr.cidade || '');
        setEstado(addr.estado || '');
        setComplemento(addr.complemento || '');
      } catch {}
    }

    const carregarPedidos = async () => {
      try {
        const res = await fetch('/api/user/orders');
        if (res.status === 401) {
          localStorage.removeItem('user_session');
          router.push('/login?redirect=/dashboard');
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setErro(data.error || 'Erro ao carregar pedidos.');
          return;
        }
        setOrders(data.orders || []);
      } catch {
        setErro('Erro de conexão ao carregar pedidos.');
      } finally {
        setCarregando(false);
      }
    };

    carregarPedidos();
  }, [router]);

  // 2. Busca dados de Pix ativos no Mercado Pago
  useEffect(() => {
    orders.forEach(order => {
      if (order.status === 'Pendente') {
        setPixData(prev => ({ ...prev, [order.id]: { qrCode: '', qrCodeBase64: '', loading: true } }));
        fetch(`/api/mercadopago/payment-status/${order.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.hasPix) {
              setPixData(prev => ({
                ...prev,
                [order.id]: { qrCode: data.qrCode, qrCodeBase64: data.qrCodeBase64, loading: false }
              }));
            } else {
              setPixData(prev => ({ ...prev, [order.id]: { qrCode: '', qrCodeBase64: '', loading: false } }));
            }
          })
          .catch(() => {
            setPixData(prev => ({ ...prev, [order.id]: { qrCode: '', qrCodeBase64: '', loading: false } }));
          });
      }
    });
  }, [orders]);

  // 3. Atualizar Dados Pessoais
  const handleAtualizarDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg('');
    setSucessoMsg('');
    setSalvando(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Sincroniza dados no LocalStorage
      const session = localStorage.getItem('user_session');
      const u = session ? JSON.parse(session) : {};
      localStorage.setItem('user_session', JSON.stringify({
        ...u,
        nome: data.user.nome,
        email: data.user.email,
        telefone,
        cpf
      }));

      setSucessoMsg('Seus dados pessoais foram salvos com sucesso!');
    } catch (err: any) {
      setErroMsg(err.message || 'Erro ao salvar perfil.');
    } finally {
      setSalvando(false);
    }
  };

  // 4. Buscar CEP (ViaCEP)
  const buscarEnderecoPorCep = async (cepDigitado: string) => {
    setCep(cepDigitado);
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRua(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
        }
      } catch {}
    }
  };

  // 5. Salvar Endereço
  const handleSalvarEndereco = (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg('');
    setSucessoMsg('');

    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      setErroMsg('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const endereco = { cep, rua, numero, bairro, cidade, estado, complemento };
    localStorage.setItem('user_address', JSON.stringify(endereco));
    setSucessoMsg('Seu endereço de entrega foi salvo para compras futuras!');
  };

  // 6. Alterar Senha
  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg('');
    setSucessoMsg('');

    if (!senhaAtual || !novaSenha) {
      setErroMsg('Preencha os campos de senha.');
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSucessoMsg('Sua senha foi alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (err: any) {
      setErroMsg(err.message || 'Erro ao alterar senha.');
    } finally {
      setSalvando(false);
    }
  };

  // 7. Enviar Troca por WhatsApp
  const handleTrocaDevolucao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedidoTrocaId || !motivoTroca) {
      setErroMsg('Por favor, insira o número do pedido e o motivo.');
      return;
    }
    const txt = `Olá! Gostaria de abrir um chamado de Troca/Devolução.\n\n*Pedido:* #${pedidoTrocaId}\n*Motivo:* ${motivoTroca}\n*Cliente:* ${nome} (${email})`;
    window.open(`https://wa.me/5517999999999?text=${encodeURIComponent(txt)}`, '_blank');
  };

  const sair = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user_session');
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', color: '#111827', fontFamily: "'Inter', sans-serif" }}>
      {/* Topo */}
      <header style={{ background: '#0d2410', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>
            BIOFLOW<span style={{ color: '#d4a843' }}>.</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/produtos" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}>
            <ShoppingBag size={13} /> Continuar Comprando
          </Link>
          <button onClick={sair} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }} >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1050, margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* Banner Olá */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px', color: '#0d2410' }}>
            Olá, {nome ? nome.split(' ') : 'Cultivador'}!
          </h1>
          <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0 }}>
            Gerencie sua conta, endereços de entrega e pedidos de adubo.
          </p>
        </div>

        {/* Alertas */}
        {sucessoMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: 12, fontSize: 13.5, fontWeight: 700, marginBottom: 20 }}>
            <CheckCircle2 size={18} /> {sucessoMsg}
          </div>
        )}

        {erroMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: 12, fontSize: 13.5, fontWeight: 700, marginBottom: 20 }}>
            <AlertCircle size={18} /> {erroMsg}
          </div>
        )}

        {/* Layout de Abas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, alignItems: 'start' }} className="lg:grid-cols-[240px_1fr]">
          
          {/* Menu de Abas */}
          <nav style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: '14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button 
              onClick={() => { setActiveTab('pedidos'); setErroMsg(''); setSucessoMsg(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: activeTab === 'pedidos' ? '#f0fdf4' : 'transparent', color: activeTab === 'pedidos' ? '#15803d' : '#4b5563', fontSize: 13.5, fontWeight: activeTab === 'pedidos' ? 800 : 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <Package size={16} /> Meus Pedidos
            </button>
            <button 
              onClick={() => { setActiveTab('dados'); setErroMsg(''); setSucessoMsg(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: activeTab === 'dados' ? '#f0fdf4' : 'transparent', color: activeTab === 'dados' ? '#15803d' : '#4b5563', fontSize: 13.5, fontWeight: activeTab === 'dados' ? 800 : 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <User size={16} /> Meus Dados
            </button>
            <button 
              onClick={() => { setActiveTab('enderecos'); setErroMsg(''); setSucessoMsg(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: activeTab === 'enderecos' ? '#f0fdf4' : 'transparent', color: activeTab === 'enderecos' ? '#15803d' : '#4b5563', fontSize: 13.5, fontWeight: activeTab === 'enderecos' ? 800 : 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <MapPin size={16} /> Meus Endereços
            </button>
            <button 
              onClick={() => { setActiveTab('trocas'); setErroMsg(''); setSucessoMsg(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: activeTab === 'trocas' ? '#f0fdf4' : 'transparent', color: activeTab === 'trocas' ? '#15803d' : '#4b5563', fontSize: 13.5, fontWeight: activeTab === 'trocas' ? 800 : 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <RefreshCw size={16} /> Trocas e Devoluções
            </button>
            <button 
              onClick={() => { setActiveTab('senha'); setErroMsg(''); setSucessoMsg(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: activeTab === 'senha' ? '#f0fdf4' : 'transparent', color: activeTab === 'senha' ? '#15803d' : '#4b5563', fontSize: 13.5, fontWeight: activeTab === 'senha' ? 800 : 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <Lock size={16} /> Alterar Senha
            </button>
          </nav>

          {/* Área de Conteúdo da Aba */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 28 }}>
            
            {/* 1. MEUS PEDIDOS */}
            {activeTab === 'pedidos' && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, color: '#0d2410', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={18} color="#15803d" /> Histórico de Pedidos
                </h2>

                {carregando ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Loader2 size={32} className="animate-spin" color="#15803d" style={{ margin: '0 auto' }} />
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <ShoppingBag size={48} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Você ainda não realizou nenhuma compra.</p>
                    <Link href="/produtos" style={{ background: '#15803d', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Ver Catálogo</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map(order => {
                      const cor = STATUS_CORES[order.status] || STATUS_CORES.Pendente;
                      const pix = pixData[order.id];

                      return (
                        <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <span style={{ fontSize: 14, fontWeight: 900 }}>Pedido #{order.orderNumber}</span>
                              <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <span style={{ background: cor.bg, color: cor.cor, fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 999 }}>{order.status}</span>
                          </div>

                          <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: 10, marginBottom: 12 }}>
                            {order.items.map((it: any, idx: number) => {
                              const nomeProd = it.nome || it.name || it.title || 'Produto';
                              const varProd = it.variacao || it.size || '';
                              const precoVal = Number(it.preco ?? it.price ?? it.unit_price ?? 0);
                              return (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '2px 0' }}>
                                  <span>{it.quantity || 1}x {nomeProd} {varProd ? `(${varProd})` : ''}</span>
                                  <span style={{ fontWeight: 700 }}>{fmt(precoVal * (it.quantity || 1))}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#4b5563', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                              <span>Total: <strong style={{ color: '#15803d', fontSize: 13.5 }}>{fmt(order.total)}</strong></span>
                            </div>
                            {order.trackingCode ? (
                              <span style={{ color: '#1e40af', fontWeight: 700 }}>📦 Rastreio: {order.trackingCode}</span>
                            ) : (
                              <span style={{ color: '#6b7280', fontSize: 11.5, fontWeight: 600 }}>🚚 Status do Envio: Aguardando código de rastreio</span>
                            )}
                          </div>

                          {/* Pix Recuperador */}
                          {order.status === 'Pendente' && (
                            <div style={{ marginTop: 14, padding: 14, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12 }}>
                              <strong style={{ fontSize: 12, color: '#b45309', display: 'block', marginBottom: 8 }}>⏳ Pagamento Aguardando Aprovação</strong>
                              
                              {pix?.loading ? (
                                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>Verificando Pix...</p>
                              ) : pix?.qrCode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                  {pix.qrCodeBase64 && (
                                    <img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="Pix" style={{ width: 120, height: 120 }} />
                                  )}
                                  <button 
                                    onClick={() => { navigator.clipboard.writeText(pix.qrCode); alert('Código Pix Copiado!'); }}
                                    style={{ background: '#15803d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    Copiar Pix Copia e Cola
                                  </button>
                                </div>
                              ) : null}

                              {order.mpPreferenceId && (
                                <a href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${order.mpPreferenceId}`} target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: 10, fontSize: 11.5, fontWeight: 700, color: '#111827', textDecoration: 'underline' }}>
                                  Pagar com Outro Método (Cartão / Boleto)
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. MEUS DADOS */}
            {activeTab === 'dados' && (
              <form onSubmit={handleAtualizarDados}>
                <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, color: '#0d2410', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={18} color="#15803d" /> Dados Pessoais
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Nome Completo *</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Endereço de E-mail *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Telefone / WhatsApp</label>
                      <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>CPF (Faturamento)</label>
                      <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                    </div>
                  </div>

                  <button type="submit" disabled={salvando} style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginTop: 10 }}>
                    {salvando ? 'Salvando...' : 'Salvar Dados Pessoais'}
                  </button>
                </div>
              </form>
            )}

            {/* 3. MEUS ENDEREÇOS */}
            {activeTab === 'enderecos' && (
              <form onSubmit={handleSalvarEndereco}>
                <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, color: '#0d2410', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="#15803d" /> Endereço de Entrega Padrão
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>CEP *</label>
                    <input type="text" value={cep} onChange={(e) => buscarEnderecoPorCep(e.target.value)} placeholder="Ex: 16603-268" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Rua / Avenida *</label>
                    <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Número *</label>
                    <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Complemento (Opcional)</label>
                    <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Ex: Bloco B Apto 10" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Bairro *</label>
                    <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Cidade *</label>
                    <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Estado / UF *</label>
                    <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Ex: SP" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <button type="submit" style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginTop: 10 }}>
                      Salvar Endereço de Entrega
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 4. TROCAS E DEVOLUÇÕES */}
            {activeTab === 'trocas' && (
              <form onSubmit={handleTrocaDevolucao}>
                <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: '#0d2410', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={18} color="#15803d" /> Trocas & Devoluções
                </h2>
                <p style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, marginBottom: 20 }}>
                  Conforme a política oficial Bioflow, você possui até **7 dias corridos** após o recebimento para solicitar devoluções por arrependimento, ou **48 horas** em caso de frascos avariados no transporte. Insira os dados abaixo para falar direto com nossa equipe de suporte no WhatsApp.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Código ou Número do Pedido *</label>
                    <input type="text" value={pedidoTrocaId} onChange={(e) => setPedidoTrocaId(e.target.value)} placeholder="Ex: BF-87113535" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Escreva os detalhes ou motivos *</label>
                    <textarea rows={3} value={motivoTroca} onChange={(e) => setMotivoTroca(e.target.value)} placeholder="Ex: Recebi o frasco Bio-Green vazado ou desejo devolver o substrato lacrado por arrependimento..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical' }} required />
                  </div>

                  <button type="submit" style={{ background: '#0d2410', color: 'white', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'start' }}>
                    Chamar o Suporte de Trocas
                  </button>
                </div>
              </form>
            )}

            {/* 5. ALTERAR SENHA */}
            {activeTab === 'senha' && (
              <form onSubmit={handleAlterarSenha}>
                <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, color: '#0d2410', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={18} color="#15803d" /> Segurança da Conta
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Senha Atual *</label>
                    <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Digite sua senha atual" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Nova Senha (Mín. 6 dígitos) *</label>
                    <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Escolha a nova senha" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} required />
                  </div>

                  <button type="submit" disabled={salvando} style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginTop: 10 }}>
                    {salvando ? 'Processando...' : 'Alterar Minha Senha'}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={40} className="animate-spin" color="#15803d" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}