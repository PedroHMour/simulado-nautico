"use client";

import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { 
  Anchor, Clock, CheckCircle, XCircle, ChevronRight, 
  Home, User, BookOpen, LogOut, Menu, 
  Award, Phone, Lock, Mail, ArrowLeft, Loader2, UserPlus
} from "lucide-react";

// --- CONFIGURAÇÃO DO SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// --- DADOS MOCKADOS ---
const CATEGORIAS = [
  { 
    id: 1, titulo: "Arrais Amador", subtitulo: "Lanchas e Barcos",
    img: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=1000",
    questoes: 40, tempo: "2h" 
  },
  { 
    id: 2, titulo: "Motonauta", subtitulo: "Jet Ski / Moto Aquática",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000",
    questoes: 20, tempo: "1h30"
  },
  { 
    id: 3, titulo: "Mestre Amador", subtitulo: "Navegação Costeira",
    img: "https://images.unsplash.com/photo-1500930500208-4a5c06537b17?auto=format&fit=crop&q=80&w=1000",
    questoes: 40, tempo: "2h" 
  },
];

const PERGUNTAS_MOCK = [
  {
    id: 1, pergunta: "Quando duas embarcações navegam em rumos cruzados, quem tem a preferência?",
    opcoes: ["A que vê a outra pelo seu bombordo (esquerdo)", "A que tem maior velocidade", "A que vê a outra pelo seu boreste (direito)", "A embarcação de maior porte"],
    correta: 2,
  },
  {
    id: 2, pergunta: "Qual o significado de uma boia encarnada (vermelha) no balizamento?",
    opcoes: ["Deve ser deixada por bombordo de quem entra", "Águas seguras", "Perigo isolado", "Deve ser deixada por boreste de quem entra"],
    correta: 0,
  },
];

export default function App() {
  // Estados de Navegação
  const [telaAtual, setTelaAtual] = useState<"login" | "cadastro" | "recuperar" | "home" | "simulado" | "resultado">("login");
  const [loading, setLoading] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  
  // Estados de Auth
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroAuth, setErroAuth] = useState("");
  const [msgSucesso, setMsgSucesso] = useState("");
  const [usuario, setUsuario] = useState<any>(null);

  // Estados do Simulado
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<number[]>([]);
  const [tempo, setTempo] = useState(0);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);

  // Verificar Sessão
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUsuario(session.user);
        setTelaAtual("home");
      }
    };
    if (!supabaseUrl.includes('SUA_URL')) checkUser();
  }, []);

  // --- FUNÇÕES DE AUTH ---
  
  // 1. LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErroAuth("");

    // Fallback Demo
    if (supabaseUrl.includes('SUA_URL')) {
        setTimeout(() => { setUsuario({ email: email, user_metadata: { full_name: "Visitante Demo" } }); setTelaAtual("home"); setLoading(false); }, 1000);
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErroAuth("E-mail ou senha incorretos.");
    } else {
      setUsuario(data.user);
      setTelaAtual("home");
    }
    setLoading(false);
  };

  // 2. CADASTRO (NOVA)
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErroAuth("");

    if (supabaseUrl.includes('SUA_URL')) {
        setTimeout(() => { setUsuario({ email: email, user_metadata: { full_name: nome } }); setTelaAtual("home"); setLoading(false); }, 1000);
        return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { full_name: nome }, // Salva o nome para exibir depois
      },
    });

    if (error) {
      setErroAuth(error.message);
    } else {
      // Se "Confirm Email" estiver desligado no Supabase, ele loga direto
      if (data.session) {
        setUsuario(data.user);
        setTelaAtual("home");
      } else {
        setMsgSucesso("Conta criada! Verifique seu e-mail para confirmar.");
        setTelaAtual("login");
      }
    }
    setLoading(false);
  };

  // 3. RECUPERAÇÃO
  const handleRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErroAuth(""); setMsgSucesso("");
    
    if (supabaseUrl.includes('SUA_URL')) {
        setMsgSucesso(`Link enviado para ${email}`); setLoading(false); return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) setErroAuth(error.message);
    else setMsgSucesso("Link enviado! Verifique seu e-mail.");
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuario(null); setTelaAtual("login"); setEmail(""); setSenha(""); setNome("");
  };

  // Funções do Simulado (Mantidas iguais)
  useEffect(() => {
    let int: NodeJS.Timeout;
    if (cronometroAtivo) int = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(int);
  }, [cronometroAtivo]);

  const formatarTempo = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const iniciarSimulado = () => { setTelaAtual("simulado"); setIndicePergunta(0); setRespostasUsuario([]); setTempo(0); setCronometroAtivo(true); window.scrollTo(0, 0); };
  const responder = (idx: number) => { const n = [...respostasUsuario]; n[indicePergunta] = idx; setRespostasUsuario(n); };
  const proximaPergunta = () => { if (indicePergunta < PERGUNTAS_MOCK.length - 1) setIndicePergunta(i => i + 1); else { setCronometroAtivo(false); setTelaAtual("resultado"); window.scrollTo(0, 0); }};
  const calcularAcertos = () => respostasUsuario.reduce((acc, resp, i) => resp === PERGUNTAS_MOCK[i].correta ? acc + 1 : acc, 0);

  // --- UI COMPONENTS ---
  const Navbar = () => (
    <>
      <div className="bg-blue-950 text-white text-xs py-2 px-4 hidden md:flex justify-between items-center">
        <span>Central do Aluno Exclusiva</span>
        <div className="flex gap-4"><span className="flex items-center gap-1"><Phone size={12} /> Suporte</span><span className="flex items-center gap-1"><CheckCircle size={12} /> Online</span></div>
      </div>
      <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTelaAtual("home")}>
              <div className="bg-blue-900 p-2 rounded text-white"><Anchor size={24} /></div>
              <div className="leading-tight"><h1 className="text-xl font-bold text-blue-900">NÁUTICA<span className="text-blue-500">PRO</span></h1><p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Sistema de Ensino</p></div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => setTelaAtual("home")} className="text-blue-900 font-medium">Simulados</button>
              <div className="flex items-center gap-3 cursor-pointer group relative">
                <div className="text-right"><p className="text-sm font-bold text-gray-800">{usuario?.user_metadata?.full_name || usuario?.email?.split('@')[0] || "Aluno"}</p><p className="text-xs text-green-600">Online</p></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm"><User size={20} /></div>
                <button onClick={handleLogout} className="absolute -bottom-10 right-0 w-24 bg-white text-red-600 text-sm font-medium py-2 px-4 shadow-lg rounded-lg border border-gray-100 hidden group-hover:flex items-center gap-2"><LogOut size={14} /> Sair</button>
              </div>
            </nav>
            <button className="md:hidden text-gray-600 p-2" onClick={() => setMenuMobileAberto(!menuMobileAberto)}><Menu size={28} /></button>
          </div>
        </div>
        {menuMobileAberto && (<div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg absolute w-full z-50"><button className="block w-full text-left font-bold text-blue-900">Simulados</button><button onClick={handleLogout} className="block w-full text-left text-red-600 font-bold">Sair</button></div>)}
      </header>
    </>
  );

  // --- TELA: LOGIN / CADASTRO / RECUPERAR ---
  if (["login", "cadastro", "recuperar"].includes(telaAtual)) {
    const titulos = { login: "Acesse sua conta", cadastro: "Crie sua conta", recuperar: "Recuperar Acesso" };
    const descricoes = { login: "Entre com suas credenciais de aluno.", cadastro: "Preencha os dados para começar.", recuperar: "Enviaremos instruções para seu e-mail." };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
        <div className="hidden md:flex md:w-1/2 bg-blue-900 relative overflow-hidden items-center justify-center p-12 text-white">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-950 opacity-90"></div>
           <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 object-cover opacity-20 mix-blend-overlay" alt="Mar" />
           <div className="relative z-10 max-w-lg">
             <div className="mb-8 inline-block bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20"><Anchor size={48} className="text-white" /></div>
             <h1 className="text-5xl font-bold mb-6 leading-tight">Sua Habilitação <br/>Náutica Começa Aqui.</h1>
             <p className="text-blue-100 text-lg leading-relaxed font-light">Plataforma oficial de simulados. Prepare-se para Arrais, Motonauta e Mestre Amador.</p>
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="md:hidden flex justify-center mb-8"><div className="bg-blue-900 p-3 rounded-lg text-white"><Anchor size={32} /></div></div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{titulos[telaAtual]}</h2>
              <p className="mt-3 text-gray-500">{descricoes[telaAtual]}</p>
            </div>

            {(erroAuth || msgSucesso) && (
              <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${erroAuth ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                {erroAuth ? <XCircle className="shrink-0 mt-0.5" size={16} /> : <CheckCircle className="shrink-0 mt-0.5" size={16} />}<span>{erroAuth || msgSucesso}</span>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={telaAtual === 'login' ? handleLogin : telaAtual === 'cadastro' ? handleCadastro : handleRecuperacao}>
              {telaAtual === 'cadastro' && (
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                   <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={20} /></div><input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50 focus:bg-white" placeholder="Seu Nome" /></div>
                 </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={20} /></div><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50 focus:bg-white" placeholder="aluno@exemplo.com" /></div>
              </div>

              {telaAtual !== 'recuperar' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700">Senha</label>
                    {telaAtual === 'login' && <button type="button" onClick={() => setTelaAtual('recuperar')} className="text-sm font-medium text-blue-600 hover:text-blue-500">Esqueceu?</button>}
                  </div>
                  <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={20} /></div><input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50 focus:bg-white" placeholder="••••••••" /></div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="animate-spin" /> : (telaAtual === 'login' ? 'Entrar no Sistema' : telaAtual === 'cadastro' ? 'Criar Minha Conta' : 'Enviar Link')}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              {telaAtual === 'login' && (
                <p className="text-sm text-gray-600">Não tem conta? <button onClick={() => setTelaAtual('cadastro')} className="font-bold text-blue-600 hover:text-blue-500">Cadastre-se grátis</button></p>
              )}
              {telaAtual === 'cadastro' && (
                <p className="text-sm text-gray-600">Já tem conta? <button onClick={() => setTelaAtual('login')} className="font-bold text-blue-600 hover:text-blue-500">Faça Login</button></p>
              )}
              {telaAtual === 'recuperar' && (
                <button onClick={() => { setTelaAtual('login'); setErroAuth(''); }} className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-500 hover:text-gray-900"><ArrowLeft size={16} /> Voltar para o Login</button>
              )}
            </div>
          </div>
          <div className="mt-auto pt-8 text-center text-xs text-gray-400">&copy; 2024 NáuticaPro. Tecnologia Educacional.</div>
        </div>
      </div>
    );
  }

  // --- TELA: HOME / SIMULADO / RESULTADO (Mesmo código de antes) ---
  if (telaAtual === "home") {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
        <Navbar />
        <div className="bg-blue-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-block bg-blue-800 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-blue-700">Última atualização: Julho 2024</div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Olá, {usuario?.user_metadata?.full_name?.split(' ')[0] || "Comandante"}! <br/><span className="text-blue-300">Pronto para navegar?</span></h2>
              <p className="text-blue-100 text-lg md:max-w-md">Selecione abaixo a categoria da sua prova para iniciar um simulado.</p>
            </div>
            <div className="hidden md:block bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-80">
              <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-orange-500 rounded-lg text-white"><Award size={24} /></div><div><p className="text-xs text-blue-200">Seu desempenho</p><p className="font-bold text-xl">Arrais Amador</p></div></div>
              <div className="w-full bg-blue-950 rounded-full h-2 mb-2"><div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div></div>
              <p className="text-right text-xs text-orange-400 font-bold">75% Aprovado</p>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-8"><div className="h-8 w-1 bg-orange-500 rounded-full"></div><h3 className="text-2xl font-bold text-gray-800">Simulados Disponíveis</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CATEGORIAS.map((cat) => (
              <div key={cat.id} onClick={iniciarSimulado} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <img src={cat.img} alt={cat.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white"><h4 className="font-bold text-lg">{cat.titulo}</h4><p className="text-xs text-gray-200">{cat.subtitulo}</p></div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500"><span className="flex items-center gap-1"><BookOpen size={16} /> {cat.questoes} Questões</span><span className="flex items-center gap-1"><Clock size={16} /> {cat.tempo}</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '0%' }}></div></div>
                    <p className="text-xs text-gray-400">Nunca realizado</p>
                  </div>
                  <button className="mt-6 w-full py-3 border-2 border-blue-900 text-blue-900 font-bold rounded-lg hover:bg-blue-900 hover:text-white transition-colors flex items-center justify-center gap-2">Iniciar Prova <ChevronRight size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (telaAtual === "simulado") {
    const questaoAtual = PERGUNTAS_MOCK[indicePergunta];
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
             <button onClick={() => setTelaAtual("home")} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"><LogOut size={18} /><span className="hidden sm:inline">Abandonar</span></button>
              <div className="flex items-center gap-3"><div className="flex flex-col items-end"><span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Tempo</span><span className={`text-lg font-mono font-bold ${tempo > 3600 ? 'text-red-500' : 'text-blue-900'}`}>{formatarTempo(tempo)}</span></div></div>
          </div>
        </div>
        <div className="w-full h-1 bg-gray-200"><div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((indicePergunta + 1) / PERGUNTAS_MOCK.length) * 100}%` }}></div></div>
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col md:justify-center">
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-6"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Questão {indicePergunta + 1} de {PERGUNTAS_MOCK.length}</span></div>
             <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed mb-8">{questaoAtual.pergunta}</h2>
             <div className="space-y-3">
                {questaoAtual.opcoes.map((opcao, idx) => (
                  <button key={idx} onClick={() => responder(idx)} className={`w-full p-4 md:p-5 rounded-xl text-left text-sm md:text-base transition-all border-2 flex items-center gap-4 group ${respostasUsuario[indicePergunta] === idx ? "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm" : "border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-white"}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${respostasUsuario[indicePergunta] === idx ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 group-hover:border-blue-300"}`}>{respostasUsuario[indicePergunta] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
                    {opcao}
                  </button>
                ))}
             </div>
          </div>
          <div className="mt-8 flex justify-end">
             <button onClick={proximaPergunta} disabled={respostasUsuario[indicePergunta] === undefined} className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${respostasUsuario[indicePergunta] !== undefined ? "bg-orange-500 text-white hover:bg-orange-600 translate-y-0" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>{indicePergunta === PERGUNTAS_MOCK.length - 1 ? "Finalizar Prova" : "Próxima Questão"}<ChevronRight size={24} /></button>
          </div>
        </main>
      </div>
    );
  }

  if (telaAtual === "resultado") {
    const acertos = calcularAcertos();
    const porcentagem = Math.round((acertos / PERGUNTAS_MOCK.length) * 100);
    const aprovado = porcentagem >= 50;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">
           <div className="relative inline-block mb-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${aprovado ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{aprovado ? <Award size={48} /> : <XCircle size={48} />}</div>
              {aprovado && (<div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-full border-4 border-white"><CheckCircle size={20} /></div>)}
           </div>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">{aprovado ? "Aprovado!" : "Não foi dessa vez"}</h2>
           <p className="text-gray-500 mb-8">Você atingiu <strong className={aprovado ? "text-green-600" : "text-red-600"}>{porcentagem}%</strong> de aproveitamento. {aprovado ? " Você está pronto para a prova teórica." : " Recomendamos revisar os módulos 2 e 3."}</p>
           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-xs text-gray-400 uppercase font-bold">Acertos</p><p className="text-2xl font-bold text-gray-800">{acertos}/{PERGUNTAS_MOCK.length}</p></div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-xs text-gray-400 uppercase font-bold">Tempo</p><p className="text-2xl font-bold text-gray-800">{formatarTempo(tempo)}</p></div>
           </div>
           <button onClick={() => setTelaAtual("home")} className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20">Voltar ao Início</button>
        </div>
      </div>
    );
  }
  return null;
}