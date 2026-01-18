"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { TelaTipo, Usuario, QuestionDB, SimuladoCardType, ExerciseTopicDB } from "@/types";

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
import { AdminExercises } from "@/components/admin/AdminExercises";
import { ModalResetPassword } from "@/components/auth/ModalResetPassword";

// Ícones
import { Anchor, Ship, Zap, Compass, Target, LifeBuoy, Flame, AlertTriangle, Lock, BookOpen, ArrowRight, LogOut, Loader2, School } from "lucide-react";

// Mapeamento auxiliar
const ICON_MAP: Record<string, React.ReactNode> = {
    'Ship': <Ship size={32} />, 'Anchor': <Anchor size={32} />, 'Target': <Target size={32} />,
    'LifeBuoy': <LifeBuoy size={32} />, 'Flame': <Flame size={32} />, 'AlertTriangle': <AlertTriangle size={32} />,
    'Zap': <Zap size={32} />, 'Compass': <Compass size={32} />
};

const SIMULADOS_PRINCIPAIS: SimuladoCardType[] = [
  { id: 1, titulo: "Motonauta", sigla: "MTA", db_category: "MTA", subtitulo: "Jet Ski em águas interiores", questoes: 20, tempo: "1h30", minimo: 10, icon: <Zap size={32} /> },
  { id: 2, titulo: "Arrais-Amador", sigla: "ARA", db_category: "ARA", subtitulo: "Navegação interior", questoes: 40, tempo: "2h00", minimo: 20, icon: <Anchor size={32} /> },
  { id: 3, titulo: "Mestre-Amador", sigla: "MSA", db_category: "MSA", subtitulo: "Navegação costeira", questoes: 40, tempo: "2h00", minimo: 20, icon: <Ship size={32} /> },
  { id: 4, titulo: "Capitão-Amador", sigla: "CPA", db_category: "CPA", subtitulo: "Navegação oceânica", questoes: 40, tempo: "4h00", minimo: 20, icon: <Compass size={32} /> },
];

export default function App() {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [telaAtual, setTelaAtualState] = useState<TelaTipo>("login");
  const [loadingSimulado, setLoadingSimulado] = useState(false);
  
  // Modais
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [simuladoSelecionado, setSimuladoSelecionado] = useState<SimuladoCardType | null>(null);
  const [modalPremiumOpen, setModalPremiumOpen] = useState(false);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [modalResetSenhaOpen, setModalResetSenhaOpen] = useState(false);

  // Auth
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erroAuth, setErroAuth] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Dados
  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [exerciseTopics, setExerciseTopics] = useState<ExerciseTopicDB[]>([]);
  
  // Quiz
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<number[]>([]);
  const [tempo, setTempo] = useState(0);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);
  const [categoriaAtualSimulado, setCategoriaAtualSimulado] = useState<string>("GERAL");

  // NAVEGAÇÃO
  const navegarPara = useCallback((novaTela: TelaTipo) => {
      setTelaAtualState(novaTela);
      const url = new URL(window.location.href);
      url.searchParams.set("t", novaTela);
      window.history.replaceState({}, "", url);
  }, []);

  const handleLogout = useCallback(async () => {
    setUsuario(null);
    navegarPara("login");
    localStorage.clear();
    sessionStorage.clear();
    try { await supabase.auth.signOut(); } catch (err) { console.error("Erro logout:", err); }
  }, [navegarPara]);

  const carregarDadosPerfil = async (authUser: User) => {
    try {
        setUsuario(current => ({ 
            ...current, 
            id: authUser.id, 
            email: authUser.email, 
            user_metadata: authUser.user_metadata,
            created_at: authUser.created_at
        }));

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        if (profile) {
            setUsuario(prev => prev ? ({ ...prev, school_id: profile.school_id }) : prev);
        }
    } catch (error) { console.error("Erro perfil:", error); }
  };

  // --- INICIALIZAÇÃO BLINDADA ---
  useEffect(() => {
    let mounted = true;

    const initApp = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (mounted) {
                if (data.session) {
                    const params = new URLSearchParams(window.location.search);
                    const telaSalva = params.get("t") as TelaTipo;
                    if (telaSalva && telaSalva !== 'login') {
                        setTelaAtualState(telaSalva);
                    } else {
                        setTelaAtualState("home");
                    }
                    carregarDadosPerfil(data.session.user);
                } else {
                    navegarPara("login");
                }
            }
        } catch (err) {
            console.error("Erro Init:", err);
            if (mounted) navegarPara("login");
        } finally {
            if (mounted) setLoadingAuth(false);
        }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        setLoadingAuth(false);
        const params = new URLSearchParams(window.location.search);
        const telaSalva = params.get("t") as TelaTipo;
        
        if (telaAtual === 'login') {
             setTelaAtualState((telaSalva && telaSalva !== 'login') ? telaSalva : "home");
        }
        
        await carregarDadosPerfil(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null);
        navegarPara("login");
        setLoadingAuth(false);
      } else if (event === 'PASSWORD_RECOVERY') {
        setModalResetSenhaOpen(true);
      }
    });

    return () => { 
        mounted = false; 
        subscription.unsubscribe(); 
    };
  }, [navegarPara]); 

  // Timer
  useEffect(() => {
    let int: NodeJS.Timeout;
    if (cronometroAtivo) int = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(int);
  }, [cronometroAtivo]);

  // Fetch Exercícios
  useEffect(() => {
      if (telaAtual === 'exercicios' && usuario && exerciseTopics.length === 0) {
          const fetchExercicios = async () => {
              let query = supabase.from('exercise_topics').select('*').eq('active', true);
              if (usuario.school_id) {
                  query = query.or(`school_id.is.null,school_id.eq.${usuario.school_id}`);
              } else {
                  query = query.is('school_id', null);
              }
              const { data } = await query;
              if (data) setExerciseTopics(data as ExerciseTopicDB[]);
          };
          fetchExercicios();
      }
  }, [telaAtual, usuario, exerciseTopics.length]);

  // Login/Cadastro
  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErroAuth(null);
      try {
          if (telaAtual === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
            if (error) throw error;
          } else {
            const { error } = await supabase.auth.signUp({ 
                email, password: senha, options: { data: { full_name: nome } } 
            });
            if (error) throw error;
            alert("Cadastro realizado! Verifique seu e-mail.");
          }
      } catch (err: unknown) {
          if (err instanceof Error) {
            setErroAuth(err.message);
          } else {
            setErroAuth("Ocorreu um erro desconhecido.");
          }
      }
  };

  // Iniciar Simulado
  const iniciarSimulado = async (config: { category?: string, topic?: string, limit: number, title: string }) => {
    setLoadingSimulado(true);
    try {
      let query = supabase.from('questions').select('*').eq('active', true);
      if (config.category) query = query.eq('category', config.category);
      if (config.topic) query = query.eq('topic', config.topic);

      const { data, error } = await query.limit(config.limit);

      if (error) throw error;
      if (!data || data.length === 0) { alert(`Banco vazio para ${config.title}.`); return; }

      setCategoriaAtualSimulado(config.category || config.topic || "GERAL");
      setQuestions(data.sort(() => Math.random() - 0.5) as QuestionDB[]);
      setModalDetalhesOpen(false);
      navegarPara("simulado");
      setIndicePergunta(0);
      setRespostasUsuario([]);
      setTempo(0);
      setCronometroAtivo(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar simulado.");
    } finally { setLoadingSimulado(false); }
  };

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-900" size={40} /></div>;

  if (telaAtual === "login" || telaAtual === "cadastro") {
    return <AuthForm loading={false} onSubmit={handleLoginSubmit} error={erroAuth} email={email} setEmail={setEmail} senha={senha} setSenha={setSenha} nome={nome} setNome={setNome} modo={telaAtual} alternarModo={() => navegarPara(telaAtual === 'login' ? 'cadastro' : 'login')} />;
  }

  if (telaAtual === "simulado") {
    const finalizarSimulado = async () => { 
        setCronometroAtivo(false); 
        const mapLetras = ['A', 'B', 'C', 'D', 'E'];
        const acertos = respostasUsuario.reduce((acc, idx, qIdx) => questions[qIdx].correct_answer === mapLetras[idx] ? acc + 1 : acc, 0);

        if (usuario && usuario.id) {
            try {
                await supabase.from('results').insert({
                    user_id: usuario.id,
                    category: categoriaAtualSimulado,
                    score: acertos,
                    total_questions: questions.length,
                    time_spent_seconds: tempo,
                    school_id: usuario.school_id || null
                });
            } catch (error) { console.error("Erro save:", error); }
        }
        navegarPara("resultado"); 
    };
    return <QuizRunner questions={questions} indicePergunta={indicePergunta} respostasUsuario={respostasUsuario} tempo={tempo} onResponder={(idx) => { const n = [...respostasUsuario]; n[indicePergunta] = idx; setRespostasUsuario(n); }} onProxima={() => indicePergunta < questions.length - 1 ? setIndicePergunta(i => i + 1) : finalizarSimulado()} onSair={() => navegarPara("home")} />;
  }

  if (telaAtual === "resultado") {
    const mapLetras = ['A', 'B', 'C', 'D', 'E'];
    const acertos = respostasUsuario.reduce((acc, idx, qIdx) => questions[qIdx].correct_answer === mapLetras[idx] ? acc + 1 : acc, 0);
    return <ResultView acertos={acertos} total={questions.length} tempo={tempo} onRestart={() => navegarPara("home")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0 fade-in duration-300">
      <Navbar usuario={usuario} telaAtual={telaAtual as TelaTipo} setTelaAtual={navegarPara} handleLogout={handleLogout} onOpenSchool={() => setSchoolModalOpen(true)} />
      
      {schoolModalOpen && usuario && <SchoolModal usuario={usuario} setOpen={setSchoolModalOpen} onSucesso={() => carregarDadosPerfil(usuario as unknown as User)} />}
      {modalDetalhesOpen && <ModalDetalhes simulado={simuladoSelecionado} setOpen={setModalDetalhesOpen} iniciar={() => iniciarSimulado({ category: simuladoSelecionado?.db_category, limit: simuladoSelecionado?.questoes || 10, title: simuladoSelecionado?.titulo || '' })} loading={loadingSimulado} />}
      {modalPremiumOpen && <ModalPremium setOpen={setModalPremiumOpen} />}
      {modalResetSenhaOpen && <ModalResetPassword setOpen={setModalResetSenhaOpen} />}

      {telaAtual === "home" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-2">
           <div className="mb-6 bg-blue-900 rounded-xl p-4 flex items-center justify-between text-white shadow-lg">
              <div><h3 className="font-bold text-lg">Área do Aluno</h3><p className="text-blue-200 text-sm">Bons estudos!</p></div>
              <div className="flex gap-2 flex-wrap justify-end">
                 <button onClick={() => navegarPara("admin_questoes")} className="bg-white/10 text-white px-3 py-2 rounded-lg font-bold hover:bg-white/20 text-xs md:text-sm border border-white/10">Questões</button>
                 <button onClick={() => navegarPara("admin_exercicios")} className="bg-white/10 text-white px-3 py-2 rounded-lg font-bold hover:bg-white/20 text-xs md:text-sm border border-white/10">Exercícios</button>
                 <button onClick={() => navegarPara("admin_alunos")} className="bg-white text-blue-900 px-3 py-2 rounded-lg font-bold hover:bg-blue-50 text-xs md:text-sm shadow-sm">Alunos</button>
              </div>
           </div>
           <div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">Simulados Oficiais</h2><p className="text-gray-500">Selecione sua habilitação.</p></div>
           <SimuladoList simulados={SIMULADOS_PRINCIPAIS} onSelect={(s) => { setSimuladoSelecionado(s); setModalDetalhesOpen(true); }} />
        </div>
      )}

      {telaAtual === "exercicios" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-2">
           <div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">Exercícios Práticos</h2><p className="text-gray-500">Treine por matéria.</p></div>
           {exerciseTopics.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                   <Loader2 className="animate-spin text-blue-900" />
                   <p className="text-gray-400 font-medium">Carregando tópicos...</p>
               </div>
           ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {exerciseTopics.map((topico) => (
                   <div key={topico.id} onClick={() => iniciarSimulado({ topic: topico.topic_tag, limit: 10, title: topico.title })} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden">
                      <div className={`p-4 rounded-full ${topico.color_class} mb-1 group-hover:scale-110 transition-transform`}>{ICON_MAP[topico.icon_name] || <Ship />}</div>
                      <div><h3 className="font-bold text-gray-800 text-sm">{topico.title}</h3><p className="text-xs text-gray-400">{topico.description || "Praticar"}</p></div>
                      <div className="absolute top-2 right-2 text-gray-300"><Lock size={14} /></div>
                   </div>
                 ))}
               </div>
           )}
        </div>
      )}

      {telaAtual === "admin_questoes" && <div className="min-h-screen bg-slate-50 pb-20"><AdminQuestions /></div>}
      {telaAtual === "admin_alunos" && usuario && <div className="min-h-screen bg-slate-50 pb-20"><AdminStudents usuario={usuario} /></div>}
      {telaAtual === "admin_exercicios" && usuario && <div className="min-h-screen bg-slate-50 pb-20"><AdminExercises usuario={usuario} /></div>}

      {telaAtual === "apostilas" && (
          <div className="max-w-4xl mx-auto p-6 text-center animate-in slide-in-from-bottom-2">
             <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100">
                <BookOpen size={48} className="mx-auto text-blue-200 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Material Didático</h1>
                <p className="text-gray-500">Seu professor ainda não disponibilizou apostilas.</p>
             </div>
          </div>
      )}

      {/* CORREÇÃO: Passando user_id para evitar loop no mobile */}
      {telaAtual === "estatisticas" && (
        <div className="pb-24">
            <StatsView user_id={usuario?.id} />
        </div>
      )}
      
      {telaAtual === "perfil" && (
          <div className="max-w-md mx-auto p-6 animate-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">Meu Perfil</h1>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">{usuario?.user_metadata?.full_name?.charAt(0) || "A"}</div>
                <div><h2 className="font-bold text-lg text-gray-800">{usuario?.user_metadata?.full_name}</h2><p className="text-sm text-gray-500">{usuario?.email}</p></div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button className="w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 flex justify-between items-center text-gray-700 font-medium">Editar Meus Dados <ArrowRight size={16} className="text-gray-400"/></button>
                <button onClick={() => setSchoolModalOpen(true)} className="w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 flex justify-between items-center text-gray-700 font-medium"><div className="flex items-center gap-2"><School size={16} /><span>{usuario?.school ? `Escola: ${usuario.school.slug}` : "Vincular Escola"}</span></div><ArrowRight size={16} className="text-gray-400"/></button>
                <button onClick={handleLogout} className="w-full text-left p-4 hover:bg-red-50 flex justify-between items-center text-red-600 font-bold">Sair da Conta <LogOut size={16} /></button>
            </div>
          </div>
      )}
      <MobileNav telaAtual={telaAtual} setTelaAtual={navegarPara} />
    </div>
  );
}