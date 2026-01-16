"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; // Importação adicionada para corrigir o erro
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

// Ícones e Dados
import { Anchor, Ship, Zap, Compass, Target, LifeBuoy, Flame, AlertTriangle, Lock, BookOpen, ArrowRight, LogOut, Loader2 } from "lucide-react";

// Mapeamento auxiliar para renderizar ícones dinâmicos na tela de exercícios
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
  // ESTADOS GLOBAIS
  const [telaAtual, setTelaAtualState] = useState<TelaTipo>("login");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSimulado, setLoadingSimulado] = useState(false);
  
  // Modais
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [simuladoSelecionado, setSimuladoSelecionado] = useState<SimuladoCardType | null>(null);
  const [modalPremiumOpen, setModalPremiumOpen] = useState(false);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);

  // Auth
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erroAuth, setErroAuth] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Dados Dinâmicos
  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [exerciseTopics, setExerciseTopics] = useState<ExerciseTopicDB[]>([]);

  // Quiz
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<number[]>([]);
  const [tempo, setTempo] = useState(0);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);

  // --- PERSISTÊNCIA DE ESTADO (URL) ---
  const navegarPara = useCallback((novaTela: TelaTipo) => {
      setTelaAtualState(novaTela);
      const url = new URL(window.location.href);
      url.searchParams.set("t", novaTela);
      window.history.replaceState({}, "", url);
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    navegarPara("login");
  }, [navegarPara]);

  // Carrega o perfil do usuário
  // CORREÇÃO: Tipo 'User' importado do supabase-js ao invés de 'any'
  const carregarPerfil = useCallback(async (authUser: User) => {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select(`*, school:schools(*)`)
            .eq('id', authUser.id)
            .single();
        
        const userCompleto = {
            id: authUser.id,
            email: authUser.email,
            user_metadata: authUser.user_metadata,
            school_id: profile?.school_id,
            school: profile?.school,
            created_at: profile?.created_at
        };

        setUsuario(userCompleto);

        const params = new URLSearchParams(window.location.search);
        const telaSalva = params.get("t") as TelaTipo;
        if (telaSalva && telaSalva !== 'login') {
            setTelaAtualState(telaSalva);
        } else {
            setTelaAtualState("home");
        }
    } catch (error) {
        console.error("Erro ao carregar perfil", error);
        setErroAuth("Erro ao carregar perfil.");
    } finally {
        setLoading(false);
    }
  }, []);

  const verificarSessaoInicial = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await carregarPerfil(session.user);
    } else {
      setLoading(false);
      navegarPara("login");
    }
  }, [carregarPerfil, navegarPara]);

  useEffect(() => {
    verificarSessaoInicial();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await carregarPerfil(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null);
        navegarPara("login");
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [verificarSessaoInicial, carregarPerfil, navegarPara]);

  useEffect(() => {
    let int: NodeJS.Timeout;
    if (cronometroAtivo) int = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(int);
  }, [cronometroAtivo]);

  // --- FETCH DE EXERCÍCIOS ---
  useEffect(() => {
      if (telaAtual === 'exercicios' && usuario) {
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
  }, [telaAtual, usuario]);

  const iniciarSimulado = async (config: { category?: string, topic?: string, limit: number, title: string }) => {
    setLoadingSimulado(true);
    try {
      let query = supabase.from('questions').select('*').eq('active', true);
      
      if (config.category) query = query.eq('category', config.category);
      if (config.topic) query = query.eq('topic', config.topic);

      const { data, error } = await query.limit(config.limit);

      if (error) throw error;
      if (!data || data.length === 0) { alert(`Banco vazio para ${config.title}.`); return; }

      setQuestions(data.sort(() => Math.random() - 0.5) as QuestionDB[]);
      setModalDetalhesOpen(false);
      navegarPara("simulado");
      setIndicePergunta(0);
      setRespostasUsuario([]);
      setTempo(0);
      setCronometroAtivo(true);
      window.scrollTo(0, 0);
    } catch (err: unknown) {
      console.error(err);
      alert("Erro ao iniciar.");
    } finally { setLoadingSimulado(false); }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-blue-900" size={48} />
                  <p className="text-gray-500 font-medium">Carregando sistema...</p>
              </div>
          </div>
      );
  }

  if (telaAtual === "login" || telaAtual === "cadastro") {
    return (
      <AuthForm 
        loading={loading} 
        onSubmit={() => {}} 
        error={erroAuth} 
        email={email} setEmail={setEmail} senha={senha} setSenha={setSenha} nome={nome} setNome={setNome} 
        modo={telaAtual} 
        alternarModo={() => navegarPara(telaAtual === 'login' ? 'cadastro' : 'login')} 
      />
    );
  }

  if (telaAtual === "simulado") {
    const responder = (idx: number) => { const n = [...respostasUsuario]; n[indicePergunta] = idx; setRespostasUsuario(n); };
    const proxima = () => { if (indicePergunta < questions.length - 1) setIndicePergunta(i => i + 1); else finalizar(); };
    const finalizar = async () => {
        setCronometroAtivo(false);
        navegarPara("resultado");
    };
    return <QuizRunner questions={questions} indicePergunta={indicePergunta} respostasUsuario={respostasUsuario} tempo={tempo} onResponder={responder} onProxima={proxima} onSair={() => navegarPara("home")} />;
  }

  if (telaAtual === "resultado") {
    const mapLetras = ['A', 'B', 'C', 'D', 'E'];
    const acertos = respostasUsuario.reduce((acc, idx, qIdx) => questions[qIdx].correct_answer === mapLetras[idx] ? acc + 1 : acc, 0);
    return <ResultView acertos={acertos} total={questions.length} tempo={tempo} onRestart={() => navegarPara("home")} />;
  }

  // --- RENDER PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0">
      <Navbar usuario={usuario} telaAtual={telaAtual as TelaTipo} setTelaAtual={navegarPara} handleLogout={handleLogout} menuMobileAberto={menuMobileAberto} setMenuMobileAberto={setMenuMobileAberto} onOpenSchool={() => setSchoolModalOpen(true)} />
      
      {schoolModalOpen && usuario && <SchoolModal usuario={usuario} setOpen={setSchoolModalOpen} onSucesso={() => carregarPerfil(usuario)} />}
      {modalDetalhesOpen && <ModalDetalhes simulado={simuladoSelecionado} setOpen={setModalDetalhesOpen} iniciar={() => iniciarSimulado({ category: simuladoSelecionado?.db_category, limit: simuladoSelecionado?.questoes || 10, title: simuladoSelecionado?.titulo || '' })} loading={loadingSimulado} />}
      {modalPremiumOpen && <ModalPremium setOpen={setModalPremiumOpen} />}

      {/* HOME */}
      {telaAtual === "home" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
           {/* PAINEL ADMIN */}
           <div className="mb-6 bg-blue-900 rounded-xl p-4 flex items-center justify-between text-white shadow-lg">
              <div><h3 className="font-bold text-lg">Área da Escola</h3><p className="text-blue-200 text-sm">Painel Administrativo.</p></div>
              <div className="flex gap-2 flex-wrap justify-end">
                 <button onClick={() => navegarPara("admin_questoes")} className="bg-white text-blue-900 px-3 py-2 rounded-lg font-bold hover:bg-blue-50 text-xs md:text-sm">Questões</button>
                 <button onClick={() => navegarPara("admin_exercicios")} className="bg-white text-blue-900 px-3 py-2 rounded-lg font-bold hover:bg-blue-50 text-xs md:text-sm">Exercícios</button>
                 <button onClick={() => navegarPara("admin_alunos")} className="bg-blue-800 text-white border border-blue-700 px-3 py-2 rounded-lg font-bold hover:bg-blue-700 text-xs md:text-sm">Alunos</button>
              </div>
           </div>
           <div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">Simulados Oficiais</h2><p className="text-gray-500">Selecione sua habilitação.</p></div>
           <SimuladoList simulados={SIMULADOS_PRINCIPAIS} onSelect={(s) => { setSimuladoSelecionado(s); setModalDetalhesOpen(true); }} />
        </div>
      )}

      {/* EXERCÍCIOS */}
      {telaAtual === "exercicios" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
           <div className="mb-6 flex justify-between items-end">
             <div><h2 className="text-2xl font-bold text-gray-800">Exercícios</h2><p className="text-gray-500">Pratique por tópicos.</p></div>
           </div>
           
           {exerciseTopics.length === 0 ? (
               <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">Nenhum exercício disponível no momento.</div>
           ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {exerciseTopics.map((topico) => (
                   <div 
                      key={topico.id} 
                      onClick={() => iniciarSimulado({ topic: topico.topic_tag, limit: 10, title: topico.title })} 
                      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group"
                   >
                      <div className={`p-4 rounded-full ${topico.color_class} mb-1 group-hover:scale-110 transition-transform`}>
                          {ICON_MAP[topico.icon_name] || <Ship />}
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{topico.title}</h3>
                          <p className="text-xs text-gray-400">{topico.description || "Praticar agora"}</p>
                      </div>
                      <div className="absolute top-2 right-2 text-gray-300"><Lock size={14} /></div>
                   </div>
                 ))}
               </div>
           )}
        </div>
      )}

      {/* ADMINISTRAÇÃO */}
      {telaAtual === "admin_questoes" && <div className="min-h-screen bg-slate-50 pb-20"><AdminQuestions /></div>}
      {telaAtual === "admin_alunos" && usuario && <div className="min-h-screen bg-slate-50 pb-20"><AdminStudents usuario={usuario} /></div>}
      {telaAtual === "admin_exercicios" && usuario && <div className="min-h-screen bg-slate-50 pb-20"><AdminExercises usuario={usuario} /></div>}

      {/* APOSTILAS */}
      {telaAtual === "apostilas" && (
          <div className="max-w-4xl mx-auto p-6 text-center">
             <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100">
                <BookOpen size={48} className="mx-auto text-blue-200 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Material Didático</h1>
                <p className="text-gray-500">Seu professor ainda não disponibilizou apostilas.</p>
             </div>
          </div>
      )}

      {/* PERFIL */}
      {telaAtual === "perfil" && (
          <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">Meu Perfil</h1>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {usuario?.user_metadata?.full_name?.charAt(0) || "U"}
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-800">{usuario?.user_metadata?.full_name || "Aluno"}</h2>
                    <p className="text-sm text-gray-500">{usuario?.email}</p>
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
      )}

      {telaAtual === "estatisticas" && <StatsView />}

      <MobileNav telaAtual={telaAtual} setTelaAtual={navegarPara} />
    </div>
  );
}