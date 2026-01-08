"use client";

import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { 
  Anchor, Clock, CheckCircle, ChevronRight, 
  User, BookOpen, LogOut, Menu, 
  Award, Phone, Lock, Loader2,
  BarChart3, LifeBuoy, Flame, Ship, Target, AlertTriangle, Crown, X,
  Wind, Compass, Zap
} from "lucide-react";

// --- CONFIGURAÇÃO DO SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// --- TIPAGEM ---
// 1. DEFINIÇÃO DO TIPO DE TELA (Correção do erro de TypeScript)
type TelaTipo = "login" | "cadastro" | "home" | "exercicios" | "estatisticas" | "simulado" | "resultado";

interface Usuario {
  email?: string;
  user_metadata?: { full_name?: string };
}

// Props para o ModalPremium
interface ModalPremiumProps {
  setOpen: (v: boolean) => void;
}

// Props para o ModalDetalhes
interface SimuladoType {
  id: number;
  titulo: string;
  sigla: string;
  subtitulo: string;
  questoes: number;
  tempo: string;
  minimo: number;
  icon: React.ReactNode;
}

interface ModalDetalhesProps {
  simulado: SimuladoType | null;
  setOpen: (v: boolean) => void;
  iniciar: () => void;
}

// Props para Navbar (Atualizado com TelaTipo)
interface NavbarProps {
  usuario: Usuario | null;
  telaAtual: TelaTipo;
  setTelaAtual: (tela: TelaTipo) => void; // <--- CORREÇÃO AQUI
  handleLogout: () => void;
  menuMobileAberto: boolean;
  setMenuMobileAberto: (v: boolean) => void;
}

// --- DADOS ---
const SIMULADOS_PRINCIPAIS = [
  { 
    id: 1, titulo: "Motonauta", sigla: "MTA", subtitulo: "Jet Ski em águas interiores",
    questoes: 20, tempo: "1h30", minimo: 10, icon: <Zap size={32} className="text-blue-900" />
  },
  { 
    id: 2, titulo: "Arrais-Amador", sigla: "ARA", subtitulo: "Navegação interior (Lanchas/Barcos)",
    questoes: 40, tempo: "2h00", minimo: 20, icon: <Anchor size={32} className="text-blue-900" />
  },
  { 
    id: 3, titulo: "Mestre-Amador", sigla: "MSA", subtitulo: "Navegação costeira",
    questoes: 40, tempo: "2h00", minimo: 20, icon: <Ship size={32} className="text-blue-900" />
  },
  { 
    id: 4, titulo: "Capitão-Amador", sigla: "CPA", subtitulo: "Navegação oceânica (Sem limites)",
    questoes: 40, tempo: "4h00", minimo: 20, icon: <Compass size={32} className="text-blue-900" />
  },
  { 
    id: 5, titulo: "Veleiro", sigla: "VLA", subtitulo: "Embarcações à vela",
    questoes: 20, tempo: "1h30", minimo: 10, icon: <Wind size={32} className="text-blue-900" />
  }
];

const TOPICOS_EXERCICIOS = [
  { id: 1, titulo: "RIPEAM 72", questoes: 50, icon: <Ship size={32} />, color: "bg-blue-100 text-blue-600" },
  { id: 2, titulo: "Balizamento IALA", questoes: 46, icon: <LifeBuoy size={32} />, color: "bg-red-100 text-red-600" },
  { id: 3, titulo: "Manobra", questoes: 50, icon: <Target size={32} />, color: "bg-orange-100 text-orange-600" },
  { id: 4, titulo: "Combate a Incêndio", questoes: 39, icon: <Flame size={32} />, color: "bg-red-100 text-red-600" },
  { id: 5, titulo: "Sobrevivência", questoes: 51, icon: <LifeBuoy size={32} />, color: "bg-emerald-100 text-emerald-600" },
  { id: 6, titulo: "Primeiros Socorros", questoes: 43, icon: <AlertTriangle size={32} />, color: "bg-indigo-100 text-indigo-600" },
];

const PERGUNTAS_MOCK = [
  { id: 1, pergunta: "Quando duas embarcações navegam em rumos cruzados, quem tem a preferência?", opcoes: ["A que vê a outra pelo seu bombordo", "A que tem maior velocidade", "A que vê a outra pelo seu boreste", "A embarcação de maior porte"], correta: 2 },
  { id: 2, pergunta: "Qual o significado de uma boia encarnada (vermelha)?", opcoes: ["Bombordo de quem entra", "Águas seguras", "Perigo isolado", "Boreste de quem entra"], correta: 0 },
];

// --- COMPONENTE: NAVBAR ---
const Navbar = ({ usuario, telaAtual, setTelaAtual, handleLogout, menuMobileAberto, setMenuMobileAberto }: NavbarProps) => (
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
            <button onClick={() => setTelaAtual("home")} className={`font-medium transition-colors ${telaAtual === 'home' ? 'text-blue-900' : 'text-gray-500 hover:text-blue-900'}`}>Simulados</button>
            <button onClick={() => setTelaAtual("exercicios")} className={`font-medium transition-colors ${telaAtual === 'exercicios' ? 'text-blue-900' : 'text-gray-500 hover:text-blue-900'}`}>Exercícios</button>
            <button onClick={() => setTelaAtual("estatisticas")} className={`font-medium transition-colors ${telaAtual === 'estatisticas' ? 'text-blue-900' : 'text-gray-500 hover:text-blue-900'}`}>Estatísticas</button>
            
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group relative">
              <div className="text-right"><p className="text-sm font-bold text-gray-800">{usuario?.user_metadata?.full_name?.split(' ')[0] || "Aluno"}</p><p className="text-xs text-green-600">Online</p></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm"><User size={20} /></div>
              <button onClick={handleLogout} className="absolute -bottom-10 right-0 w-24 bg-white text-red-600 text-sm font-medium py-2 px-4 shadow-lg rounded-lg border border-gray-100 hidden group-hover:flex items-center gap-2"><LogOut size={14} /> Sair</button>
            </div>
          </nav>
          <button className="md:hidden text-gray-600 p-2" onClick={() => setMenuMobileAberto(!menuMobileAberto)}><Menu size={28} /></button>
        </div>
      </div>
      {menuMobileAberto && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg absolute w-full z-50">
          <button onClick={() => { setTelaAtual("home"); setMenuMobileAberto(false); }} className="block w-full text-left font-bold text-blue-900">Simulados</button>
          <button onClick={() => { setTelaAtual("exercicios"); setMenuMobileAberto(false); }} className="block w-full text-left font-medium text-gray-600">Exercícios</button>
          <button onClick={() => { setTelaAtual("estatisticas"); setMenuMobileAberto(false); }} className="block w-full text-left font-medium text-gray-600">Estatísticas</button>
          <button onClick={handleLogout} className="block w-full text-left text-red-600 font-bold">Sair</button>
        </div>
      )}
    </header>
  </>
);

// --- COMPONENTE: MODAL PREMIUM ---
const ModalPremium = ({ setOpen }: ModalPremiumProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-blue-950 text-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-blue-800">
      <div className="p-4 flex justify-end">
        <button onClick={() => setOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
      </div>
      <div className="px-8 pb-8 text-center">
        <div className="flex justify-center mb-6">
           <div className="bg-yellow-500 p-4 rounded-full shadow-lg shadow-yellow-500/20"><Crown size={48} className="text-white" /></div>
        </div>
        <h3 className="text-2xl font-bold mb-2">Garanta sua aprovação</h3>
        <p className="text-blue-200 text-sm mb-8">Invista no seu aprendizado e desbloqueie todas as funcionalidades.</p>
        
        <ul className="space-y-4 text-left mb-8">
          <li className="flex items-center gap-3"><CheckCircle className="text-green-400 shrink-0" size={20} /> <span className="text-sm font-medium">Libere todos os exercícios</span></li>
          <li className="flex items-center gap-3"><CheckCircle className="text-green-400 shrink-0" size={20} /> <span className="text-sm font-medium">Simulados ilimitados</span></li>
          <li className="flex items-center gap-3"><CheckCircle className="text-green-400 shrink-0" size={20} /> <span className="text-sm font-medium">Histórico de notas detalhado</span></li>
          <li className="flex items-center gap-3"><CheckCircle className="text-green-400 shrink-0" size={20} /> <span className="text-sm font-medium">Sem anúncios</span></li>
        </ul>

        <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white transition-colors mb-3">
          Continuar
        </button>
        <p className="text-xs text-blue-300">R$ 14,90 / semana</p>
      </div>
    </div>
  </div>
);

// --- COMPONENTE: MODAL DETALHES ---
const ModalDetalhes = ({ simulado, setOpen, iniciar }: ModalDetalhesProps) => {
  if (!simulado) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-900 p-8 flex flex-col items-center text-white relative">
          <button onClick={() => setOpen(false)} className="absolute top-4 right-4 bg-white/20 p-1 rounded-full hover:bg-white/30"><X size={20} /></button>
          
          <div className="bg-blue-800 p-4 rounded-full mb-4 ring-4 ring-blue-700">
            {simulado.icon}
          </div>
          
          <h3 className="text-2xl font-bold">{simulado.titulo}</h3>
          <span className="text-blue-300 font-mono text-sm mt-1">{simulado.sigla}</span>
        </div>
        <div className="p-6">
          <h4 className="font-bold text-gray-800 mb-4 text-center">{simulado.subtitulo}</h4>
          <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div className="flex items-center justify-between text-gray-600 border-b border-gray-200 pb-2">
               <span className="flex items-center gap-2 text-sm"><BookOpen size={16} className="text-blue-500" /> Assuntos</span>
               <span className="font-bold text-sm">Geral</span>
             </div>
             <div className="flex items-center justify-between text-gray-600 border-b border-gray-200 pb-2">
               <span className="flex items-center gap-2 text-sm"><Target size={16} className="text-orange-500" /> Questões</span>
               <span className="font-bold text-sm">{simulado.questoes}</span>
             </div>
             <div className="flex items-center justify-between text-gray-600 border-b border-gray-200 pb-2">
               <span className="flex items-center gap-2 text-sm"><Clock size={16} className="text-red-500" /> Tempo</span>
               <span className="font-bold text-sm">{simulado.tempo}</span>
             </div>
             <div className="flex items-center justify-between text-gray-600">
               <span className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-green-500" /> Mínimo</span>
               <span className="font-bold text-sm">{simulado.minimo} acertos</span>
             </div>
          </div>
          <button onClick={iniciar} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2">
            Iniciar Simulado <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  // Correção: usando TelaTipo para o useState
  const [telaAtual, setTelaAtual] = useState<TelaTipo>("login");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modais
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [simuladoSelecionado, setSimuladoSelecionado] = useState<SimuladoType | null>(null);
  const [modalPremiumOpen, setModalPremiumOpen] = useState(false);

  // Auth States
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroAuth, setErroAuth] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Simulado States
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<number[]>([]);
  const [tempo, setTempo] = useState(0);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);

  useEffect(() => {
    if (!supabaseUrl) return;
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setUsuario(session.user); setTelaAtual("home"); }
    };
    checkUser();
  }, []);

  useEffect(() => {
    let int: NodeJS.Timeout;
    if (cronometroAtivo) int = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(int);
  }, [cronometroAtivo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErroAuth("");
    if (!supabaseUrl) { setTimeout(() => { setUsuario({ email, user_metadata: { full_name: "Visitante Demo" } }); setTelaAtual("home"); setLoading(false); }, 1000); return; }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) setErroAuth("Credenciais inválidas."); else { setUsuario(data.user); setTelaAtual("home"); }
    setLoading(false);
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErroAuth("");
    if (!supabaseUrl) { setTimeout(() => { setUsuario({ email, user_metadata: { full_name: nome } }); setTelaAtual("home"); setLoading(false); }, 1000); return; }
    const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { full_name: nome } } });
    if (error) setErroAuth(error.message); else { 
        if (data.session) { setUsuario(data.user); setTelaAtual("home"); } 
    }
    setLoading(false);
  };

  const handleLogout = async () => { if (supabaseUrl) await supabase.auth.signOut(); setUsuario(null); setTelaAtual("login"); };

  const abrirDetalhesSimulado = (simulado: SimuladoType) => {
    setSimuladoSelecionado(simulado);
    setModalDetalhesOpen(true);
  };

  const iniciarSimulado = () => {
    setModalDetalhesOpen(false);
    setTelaAtual("simulado");
    setIndicePergunta(0);
    setRespostasUsuario([]);
    setTempo(0);
    setCronometroAtivo(true);
    window.scrollTo(0, 0);
  };

  const responder = (idx: number) => { const n = [...respostasUsuario]; n[indicePergunta] = idx; setRespostasUsuario(n); };
  const proximaPergunta = () => { if (indicePergunta < PERGUNTAS_MOCK.length - 1) setIndicePergunta(i => i + 1); else { setCronometroAtivo(false); setTelaAtual("resultado"); } };

  if (["login", "cadastro"].includes(telaAtual)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-blue-900 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"><Anchor size={32} className="text-white" /></div>
            <h1 className="text-2xl font-bold text-blue-900">NÁUTICA<span className="text-blue-500">PRO</span></h1>
            <p className="text-gray-500 text-sm mt-2">{telaAtual === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</p>
          </div>
          <form className="space-y-4" onSubmit={telaAtual === 'login' ? handleLogin : handleCadastro}>
             {telaAtual === 'cadastro' && <input type="text" placeholder="Nome Completo" className="w-full p-3 border rounded-lg" value={nome} onChange={e => setNome(e.target.value)} />}
             <input type="email" placeholder="E-mail" className="w-full p-3 border rounded-lg" value={email} onChange={e => setEmail(e.target.value)} />
             <input type="password" placeholder="Senha" className="w-full p-3 border rounded-lg" value={senha} onChange={e => setSenha(e.target.value)} />
             {erroAuth && <p className="text-red-500 text-sm">{erroAuth}</p>}
             <button disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors">{loading ? <Loader2 className="animate-spin mx-auto"/> : (telaAtual === 'login' ? 'Entrar' : 'Cadastrar')}</button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setTelaAtual(telaAtual === 'login' ? 'cadastro' : 'login')} className="text-sm text-blue-600 hover:underline">{telaAtual === 'login' ? 'Criar conta' : 'Já tenho conta'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0">
      <Navbar usuario={usuario} telaAtual={telaAtual} setTelaAtual={setTelaAtual} handleLogout={handleLogout} menuMobileAberto={menuMobileAberto} setMenuMobileAberto={setMenuMobileAberto} />
      
      {modalDetalhesOpen && <ModalDetalhes simulado={simuladoSelecionado} setOpen={setModalDetalhesOpen} iniciar={iniciarSimulado} />}
      {modalPremiumOpen && <ModalPremium setOpen={setModalPremiumOpen} />}

      {telaAtual === "home" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
           <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Categorias Oficiais</h2>
              <p className="text-gray-500">Selecione sua habilitação para iniciar o simulado.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SIMULADOS_PRINCIPAIS.map((simulado) => (
                <div key={simulado.id} onClick={() => abrirDetalhesSimulado(simulado)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-all active:scale-[0.98] group">
                   <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      {simulado.icon}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 text-lg">{simulado.titulo}</h3>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{simulado.sigla}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{simulado.subtitulo}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                         <span className="flex items-center gap-1">Q: {simulado.questoes}</span>
                         <span className="flex items-center gap-1">T: {simulado.tempo}</span>
                      </div>
                   </div>
                   <ChevronRight className="text-gray-300" />
                </div>
              ))}
           </div>
        </div>
      )}

      {telaAtual === "exercicios" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
           <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Exercícios</h2>
                <p className="text-gray-500">Pratique por tópicos específicos.</p>
              </div>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-md border border-yellow-200">PREMIUM</span>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TOPICOS_EXERCICIOS.map((topico) => (
                <div key={topico.id} onClick={() => setModalPremiumOpen(true)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group">
                   <div className={`p-4 rounded-full ${topico.color} mb-1 group-hover:scale-110 transition-transform`}>
                      {topico.icon}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{topico.titulo}</h3>
                      <p className="text-xs text-gray-400">{topico.questoes} questões</p>
                   </div>
                   <div className="absolute top-2 right-2 text-gray-300"><Lock size={14} /></div>
                </div>
              ))}
           </div>
        </div>
      )}

      {telaAtual === "estatisticas" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Estatísticas</h2>
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
             <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-blue-400" />
                <h3 className="font-bold">Histórico de Desempenho</h3>
             </div>
             <div className="h-32 flex items-end gap-2 justify-between px-2">
                {[20, 40, 35, 50, 60, 45, 70].map((h, i) => (
                   <div key={i} className="w-full bg-blue-500/30 rounded-t-sm relative group">
                      <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                   </div>
                ))}
             </div>
             <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>01/01</span><span>Hoje</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-900 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                <p className="text-gray-400 text-sm font-bold mb-2 flex items-center gap-2"><Award size={16}/> Nota Média</p>
                <span className="text-4xl font-bold text-green-500">7.5</span>
             </div>
             <div className="bg-gray-900 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
                <p className="text-gray-400 text-sm font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Mais Dificuldade</p>
                <Ship size={40} className="text-white mb-2" />
                <span className="text-sm font-bold text-white">RIPEAM 72</span>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-red-500/20 rounded-full blur-xl"></div>
             </div>
          </div>
        </div>
      )}

      {telaAtual === "simulado" && (
         <div className="min-h-screen bg-slate-50 flex flex-col font-sans fixed inset-0 z-50">
            <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex justify-between items-center">
               <button onClick={() => setTelaAtual("home")} className="text-gray-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"><X size={16}/> Sair</button>
               <span className="font-mono font-bold text-blue-900 text-lg">{Math.floor(tempo / 60).toString().padStart(2, '0')}:{(tempo % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="w-full h-1 bg-gray-200"><div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((indicePergunta + 1) / PERGUNTAS_MOCK.length) * 100}%` }}></div></div>
            <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col justify-center">
               <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">Questão {indicePergunta + 1}/{PERGUNTAS_MOCK.length}</span>
               <h2 className="text-xl font-bold text-gray-800 mb-8">{PERGUNTAS_MOCK[indicePergunta].pergunta}</h2>
               <div className="space-y-3">
                  {PERGUNTAS_MOCK[indicePergunta].opcoes.map((op, idx) => (
                    <button key={idx} onClick={() => responder(idx)} className={`w-full p-4 rounded-xl text-left border-2 transition-all ${respostasUsuario[indicePergunta] === idx ? "border-blue-600 bg-blue-50 text-blue-900 font-bold" : "border-gray-100 bg-white text-gray-600"}`}>{op}</button>
                  ))}
               </div>
               <button onClick={proximaPergunta} className="mt-8 w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg">
                  {indicePergunta === PERGUNTAS_MOCK.length - 1 ? "Finalizar" : "Próxima"}
               </button>
            </main>
         </div>
      )}

      {telaAtual === "resultado" && (
         <div className="max-w-md mx-auto p-8 text-center pt-20">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
               <Award size={64} className="text-yellow-500 mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulado Finalizado!</h2>
               <p className="text-gray-500 mb-8">Confira seus erros e acertos no histórico.</p>
               <button onClick={() => setTelaAtual("home")} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold">Voltar ao Início</button>
            </div>
         </div>
      )}

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-40 pb-safe">
         <button onClick={() => setTelaAtual("home")} className={`flex flex-col items-center p-2 ${telaAtual === 'home' ? 'text-blue-900' : 'text-gray-400'}`}>
            <Anchor size={24} /> <span className="text-[10px] font-bold mt-1">Simulados</span>
         </button>
         <button onClick={() => setTelaAtual("exercicios")} className={`flex flex-col items-center p-2 ${telaAtual === 'exercicios' ? 'text-blue-900' : 'text-gray-400'}`}>
            <Target size={24} /> <span className="text-[10px] font-medium mt-1">Exercícios</span>
         </button>
         <button onClick={() => setTelaAtual("estatisticas")} className={`flex flex-col items-center p-2 ${telaAtual === 'estatisticas' ? 'text-blue-900' : 'text-gray-400'}`}>
            <BarChart3 size={24} /> <span className="text-[10px] font-medium mt-1">Estatísticas</span>
         </button>
      </nav>
    </div>
  );
}