"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TelaTipo, Usuario, QuestionDB, SimuladoCardType } from "@/types";

// Componentes
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AuthForm } from "@/components/auth/AuthForms";
import { SimuladoList } from "@/components/dashboard/SimuladoList";
import { StatsView } from "@/components/dashboard/StatsView";
import { QuizRunner } from "@/components/simulado/QuizRunner";
import { ResultView } from "@/components/simulado/ResultView";
import { ModalDetalhes, ModalPremium } from "@/components/simulado/Modals";
import { SchoolModal } from "@/components/school/SchoolModal";
import { AdminQuestions } from "@/components/admin/AdminQuestions";
import { AdminStudents } from "@/components/admin/AdminStudents";

// Ícones e Dados
import { Anchor, Ship, Zap, Compass, Target, LifeBuoy, Flame, AlertTriangle, Lock, BookOpen, ArrowRight, LogOut } from "lucide-react";

// DADOS ESTÁTICOS
const SIMULADOS_PRINCIPAIS: SimuladoCardType[] = [
  { id: 1, titulo: "Motonauta", sigla: "MTA", db_category: "MTA", subtitulo: "Jet Ski em águas interiores", questoes: 20, tempo: "1h30", minimo: 10, icon: <Zap size={32} /> },
  { id: 2, titulo: "Arrais-Amador", sigla: "ARA", db_category: "ARA", subtitulo: "Navegação interior", questoes: 40, tempo: "2h00", minimo: 20, icon: <Anchor size={32} /> },
  { id: 3, titulo: "Mestre-Amador", sigla: "MSA", db_category: "MSA", subtitulo: "Navegação costeira", questoes: 40, tempo: "2h00", minimo: 20, icon: <Ship size={32} /> },
  { id: 4, titulo: "Capitão-Amador", sigla: "CPA", db_category: "CPA", subtitulo: "Navegação oceânica", questoes: 40, tempo: "4h00", minimo: 20, icon: <Compass size={32} /> },
];

const TOPICOS_EXERCICIOS = [
  { id: 1, titulo: "RIPEAM 72", questoes: 50, icon: <Ship size={32} />, color: "bg-blue-100 text-blue-600" },
  { id: 2, titulo: "Balizamento IALA", questoes: 46, icon: <LifeBuoy size={32} />, color: "bg-red-100 text-red-600" },
  { id: 3, titulo: "Manobra", questoes: 50, icon: <Target size={32} />, color: "bg-orange-100 text-orange-600" },
  { id: 4, titulo: "Combate a Incêndio", questoes: 39, icon: <Flame size={32} />, color: "bg-red-100 text-red-600" },
  { id: 5, titulo: "Sobrevivência", questoes: 51, icon: <LifeBuoy size={32} />, color: "bg-emerald-100 text-emerald-600" },
  { id: 6, titulo: "Primeiros Socorros", questoes: 43, icon: <AlertTriangle size={32} />, color: "bg-indigo-100 text-indigo-600" },
];

export default function App() {
  const [telaAtual, setTelaAtual] = useState<TelaTipo | "admin_questoes" | "admin_alunos" | "apostilas" | "perfil">("login");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSimulado, setLoadingSimulado] = useState(false);
  
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [simuladoSelecionado, setSimuladoSelecionado] = useState<SimuladoCardType | null>(null);
  const [modalPremiumOpen, setModalPremiumOpen] = useState(false);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erroAuth, setErroAuth] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<number[]>([]);
  const [tempo, setTempo] = useState(0);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);

  const carregarUsuarioCompleto = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`*, school:schools(*)`)
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setUsuario({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          school_id: profile.school_id,
          school: profile.school
        });
      } else {
        setUsuario(session.user as Usuario);
      }
      setTelaAtual("home");
    }
  };

  useEffect(() => {
    carregarUsuarioCompleto();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        carregarUsuarioCompleto();
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null);
        setTelaAtual("login");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let int: NodeJS.Timeout;
    if (cronometroAtivo) int = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(int);
  }, [cronometroAtivo]);

  const handleAuth = async (e: React.FormEvent, tipo: "login" | "cadastro") => {
    e.preventDefault(); setLoading(true); setErroAuth("");
    try {
      if (tipo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password: senha, 
          options: { 
            data: { full_name: nome },
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
          } 
        });

        if (error) throw error;
        if (data.session) {
            if (!data.user?.email_confirmed_at && data.session.user.app_metadata.provider === 'email') {
                await supabase.auth.signOut();
                alert("Atenção: Por favor, verifique seu e-mail para ativar a conta antes de entrar.");
                setTelaAtual("login");
                return;
            }
            await carregarUsuarioCompleto();
        } else if (data.user) {
            alert("Cadastro realizado! Um link de confirmação foi enviado para o seu e-mail.");
            setTelaAtual("login");
            setSenha("");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setErroAuth(msg);
    } finally { setLoading(false); }
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
  };

  const iniciarSimuladoReal = async () => {
    if (!simuladoSelecionado) return;
    setLoadingSimulado(true);
    try {
      // CORREÇÃO: Busca direta das colunas (*) sem tentar acessar answers aninhadas
      const { data, error } = await supabase.from('questions')
        .select('*')
        .eq('category', simuladoSelecionado.db_category)
        .eq('active', true)
        .limit(simuladoSelecionado.questoes);

      if (error) throw error;
      if (!data || data.length === 0) { alert(`Banco vazio para ${simuladoSelecionado.titulo}.`); return; }

      // Cast para QuestionDB[] porque o Supabase pode não inferir as colunas opcionais corretamente
      setQuestions(data.sort(() => Math.random() - 0.5) as QuestionDB[]);
      setModalDetalhesOpen(false);
      setTelaAtual("simulado");
      setIndicePergunta(0);
      setRespostasUsuario([]);
      setTempo(0);
      setCronometroAtivo(true);
      window.scrollTo(0, 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      console.error(err);
      alert(`Erro: ${msg}`);
    } finally { setLoadingSimulado(false); }
  };

  const responder = (idx: number) => { 
    const n = [...respostasUsuario]; n[indicePergunta] = idx; setRespostasUsuario(n); 
  };

  const calcularAcertos = () => {
    // Mapa de índice para letra: 0=A, 1=B, 2=C, 3=D, 4=E
    const mapLetras = ['A', 'B', 'C', 'D', 'E'];
    
    return respostasUsuario.reduce((acc, respIdx, qIdx) => {
      const questao = questions[qIdx];
      // Verifica se a letra correspondente ao índice escolhido é igual ao gabarito
      const letraEscolhida = mapLetras[respIdx];
      return (questao.correct_answer === letraEscolhida) ? acc + 1 : acc;
    }, 0);
  };

  const finalizarSimulado = async () => {
    if (!usuario || !simuladoSelecionado) return;
    setCronometroAtivo(false);
    const acertos = calcularAcertos();
    try {
      await supabase.from('results').insert({
        user_id: usuario.id,
        category: simuladoSelecionado.db_category,
        score: acertos,
        total_questions: questions.length,
        time_spent_seconds: tempo,
        school_id: usuario.school_id
      });
    } catch (err) { console.error("Erro ao salvar:", err); }
    setTelaAtual("resultado");
  };
  
  const proximaPergunta = () => { 
    if (indicePergunta < questions.length - 1) setIndicePergunta(i => i + 1); 
    else finalizarSimulado(); 
  };

  if (telaAtual === "login" || telaAtual === "cadastro") {
    return (
      <AuthForm 
        loading={loading} 
        onSubmit={(e) => handleAuth(e, telaAtual)} 
        error={erroAuth} 
        email={email} 
        setEmail={setEmail} 
        senha={senha} 
        setSenha={setSenha} 
        nome={nome} 
        setNome={setNome} 
        modo={telaAtual} 
        alternarModo={() => setTelaAtual(telaAtual === 'login' ? 'cadastro' : 'login')} 
      />
    );
  }

  if (telaAtual === "simulado") {
    return <QuizRunner questions={questions} indicePergunta={indicePergunta} respostasUsuario={respostasUsuario} tempo={tempo} onResponder={responder} onProxima={proximaPergunta} onSair={() => setTelaAtual("home")} />;
  }

  if (telaAtual === "resultado") {
    const acertos = calcularAcertos();
    return <ResultView acertos={acertos} total={questions.length} tempo={tempo} onRestart={() => setTelaAtual("home")} />;
  }

  // --- ADMINISTRAÇÃO ---
  if (telaAtual === "admin_questoes") {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans">
         <Navbar usuario={usuario} telaAtual={telaAtual as TelaTipo} setTelaAtual={(t) => setTelaAtual(t)} handleLogout={handleLogout} menuMobileAberto={menuMobileAberto} setMenuMobileAberto={setMenuMobileAberto} onOpenSchool={() => setSchoolModalOpen(true)} />
         <AdminQuestions />
      </div>
    );
  }

  if (telaAtual === "admin_alunos") {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans">
         <Navbar usuario={usuario} telaAtual={telaAtual as TelaTipo} setTelaAtual={(t) => setTelaAtual(t)} handleLogout={handleLogout} menuMobileAberto={menuMobileAberto} setMenuMobileAberto={setMenuMobileAberto} onOpenSchool={() => setSchoolModalOpen(true)} />
         {usuario && <AdminStudents usuario={usuario} />}
      </div>
    );
  }

  // --- TELAS DO MENU MOBILE ---
  if (telaAtual === "apostilas") {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 font-sans">
         <Navbar usuario={usuario} telaAtual={telaAtual as TelaTipo} setTelaAtual={(t) => setTelaAtual(t)} handleLogout={handleLogout} menuMobileAberto={menuMobileAberto} setMenuMobileAberto={setMenuMobileAberto} onOpenSchool={() => setSchoolModalOpen(true)} />
         <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-4">Material Didático</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} />
                </div>
                <h3 className="font-bold text-gray-800">Apostilas em PDF</h3>
                <p className="text-gray-500 mt-2">O material de estudo será disponibilizado pela sua escola aqui.</p>
                <button className="mt-6 bg-blue-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors">
                    Baixar Apostila (Demo)
                </button>
            </div>
         </div>
         <MobileNav telaAtual={telaAtual} setTelaAtual={setTelaAtual} />
      </div>
    );
  }

  if (telaAtual === "perfil") {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 font-sans">
         <Navbar usuario={usuario} telaAtual={telaAtual as TelaTipo} setTelaAtual={(t) => setTelaAtual(t)} handleLogout={handleLogout} menuMobileAberto={menuMobileAberto} setMenuMobileAberto={setMenuMobileAberto} onOpenSchool={() => setSchoolModalOpen(true)} />
         <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">Meu Perfil</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {usuario?.user_metadata?.full_name?.charAt(0) || "U"}
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-800">{usuario?.user_metadata?.full_name || "Aluno"}</h2>
                    <p className="text-sm text-gray-500">{usuario?.email}</p>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">Conta Ativa</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button className="w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 flex justify-between items-center text-gray-700">
                    Editar Dados <ArrowRight size={16} className="text-gray-400"/>
                </button>
                <button onClick={handleLogout} className="w-full text-left p-4 hover:bg-red-50 flex justify-between items-center text-red-600 font-bold">
                    Sair da Conta <LogOut size={16} />
                </button>
            </div>
         </div>
         <MobileNav telaAtual={telaAtual} setTelaAtual={setTelaAtual} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0">
      <Navbar usuario={usuario} telaAtual={telaAtual as TelaTipo} setTelaAtual={(t) => setTelaAtual(t)} handleLogout={handleLogout} menuMobileAberto={menuMobileAberto} setMenuMobileAberto={setMenuMobileAberto} onOpenSchool={() => setSchoolModalOpen(true)} />
      
      {schoolModalOpen && usuario && <SchoolModal usuario={usuario} setOpen={setSchoolModalOpen} onSucesso={carregarUsuarioCompleto} />}
      {modalDetalhesOpen && <ModalDetalhes simulado={simuladoSelecionado} setOpen={setModalDetalhesOpen} iniciar={iniciarSimuladoReal} loading={loadingSimulado} />}
      {modalPremiumOpen && <ModalPremium setOpen={setModalPremiumOpen} />}

      {telaAtual === "home" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
           
           {/* PAINEL DEMO DA ESCOLA */}
           <div className="mb-6 bg-blue-900 rounded-xl p-4 flex items-center justify-between text-white shadow-lg">
              <div>
                  <h3 className="font-bold text-lg">Área da Escola (Demo)</h3>
                  <p className="text-blue-200 text-sm">Cadastre perguntas e gerencie o banco.</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setTelaAtual("admin_questoes")} className="bg-white text-blue-900 px-3 py-2 rounded-lg font-bold hover:bg-blue-50 text-sm">Questões</button>
                 <button onClick={() => setTelaAtual("admin_alunos")} className="bg-blue-800 text-white border border-blue-700 px-3 py-2 rounded-lg font-bold hover:bg-blue-700 text-sm">Alunos</button>
              </div>
           </div>
           
           <div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">Categorias Oficiais</h2><p className="text-gray-500">Selecione sua habilitação.</p></div>
           <SimuladoList simulados={SIMULADOS_PRINCIPAIS} onSelect={(s) => { setSimuladoSelecionado(s); setModalDetalhesOpen(true); }} />
        </div>
      )}

      {telaAtual === "exercicios" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
           <div className="mb-6 flex justify-between items-end">
             <div><h2 className="text-2xl font-bold text-gray-800">Exercícios</h2><p className="text-gray-500">Pratique por tópicos.</p></div>
             <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-md border border-yellow-200">PREMIUM</span>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {TOPICOS_EXERCICIOS.map((topico) => (
               <div key={topico.id} onClick={() => setModalPremiumOpen(true)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group">
                  <div className={`p-4 rounded-full ${topico.color} mb-1 group-hover:scale-110 transition-transform`}>{topico.icon}</div>
                  <div><h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{topico.titulo}</h3><p className="text-xs text-gray-400">{topico.questoes} questões</p></div>
                  <div className="absolute top-2 right-2 text-gray-300"><Lock size={14} /></div>
               </div>
             ))}
           </div>
        </div>
      )}

      {telaAtual === "estatisticas" && <StatsView />}
      <MobileNav telaAtual={telaAtual} setTelaAtual={setTelaAtual} />
    </div>
  );
}