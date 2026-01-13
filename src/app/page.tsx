"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TelaTipo, Usuario, QuestionDB, SimuladoCardType } from "@/types";

// Importação dos Componentes
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AuthForm } from "@/components/auth/AuthForms";
import { SimuladoList } from "@/components/dashboard/SimuladoList";
import { StatsView } from "@/components/dashboard/StatsView";
import { QuizRunner } from "@/components/simulado/QuizRunner";
import { ResultView } from "@/components/simulado/ResultView";
import { ModalDetalhes, ModalPremium } from "@/components/simulado/Modals";
import { SchoolModal } from "@/components/school/SchoolModal";

// Ícones e Dados
import { Anchor, Ship, Zap, Compass, Target, LifeBuoy, Flame, AlertTriangle, Lock } from "lucide-react";

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
  // --- ESTADOS GLOBAIS ---
  const [telaAtual, setTelaAtual] = useState<TelaTipo>("login");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSimulado, setLoadingSimulado] = useState(false);
  
  // Estados de Modais
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [simuladoSelecionado, setSimuladoSelecionado] = useState<SimuladoCardType | null>(null);
  const [modalPremiumOpen, setModalPremiumOpen] = useState(false);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);

  // Estados de Autenticação
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erroAuth, setErroAuth] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Estados do Simulado
  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<number[]>([]);
  const [tempo, setTempo] = useState(0);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);

  // --- EFEITOS ---
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
    // 1. Tenta carregar usuário logado inicialmente
    carregarUsuarioCompleto();

    // 2. Listener para Login Google (e outros)
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

  // --- FUNÇÕES DE AUTH (ATUALIZADA) ---
  const handleAuth = async (e: React.FormEvent, tipo: "login" | "cadastro") => {
    e.preventDefault(); setLoading(true); setErroAuth("");
    try {
      if (tipo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        // O listener do useEffect vai lidar com o resto
      } else {
        // CADASTRO
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password: senha, 
          options: { 
            data: { full_name: nome },
            // Garante que o link do email traga o usuário de volta para a Home
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
          } 
        });

        if (error) throw error;

        // VERIFICAÇÃO DE SESSÃO VS CONFIRMAÇÃO
        if (data.session) {
          // Se retornou sessão, o Supabase NÃO pediu confirmação (login direto)
          await carregarUsuarioCompleto();
        } else if (data.user) {
          // Se retornou User mas NÃO retornou Sessão, o Supabase PEDIU confirmação
          alert("Cadastro realizado com sucesso!\n\nUm link de confirmação foi enviado para o seu e-mail. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.");
          setTelaAtual("login"); // Volta para tela de login
          setSenha(""); // Limpa a senha por segurança
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

  // --- LÓGICA SIMULADO ---
  const iniciarSimuladoReal = async () => {
    if (!simuladoSelecionado) return;
    setLoadingSimulado(true);
    try {
      const { data, error } = await supabase.from('questions')
        .select(`id, text, image_url, explanation_video_url, answers ( id, text, is_correct )`)
        .eq('category', simuladoSelecionado.db_category)
        .eq('active', true)
        .limit(simuladoSelecionado.questoes);

      if (error) throw error;
      if (!data || data.length === 0) { alert(`Banco vazio para ${simuladoSelecionado.titulo}.`); return; }

      setQuestions(data.sort(() => Math.random() - 0.5));
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
    return respostasUsuario.reduce((acc, respIdx, qIdx) => {
      const questao = questions[qIdx];
      return (questao?.answers?.[respIdx]?.is_correct) ? acc + 1 : acc;
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

  // --- RENDER ---
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0">
      <Navbar 
        usuario={usuario} 
        telaAtual={telaAtual} 
        setTelaAtual={setTelaAtual} 
        handleLogout={handleLogout} 
        menuMobileAberto={menuMobileAberto} 
        setMenuMobileAberto={setMenuMobileAberto}
        onOpenSchool={() => setSchoolModalOpen(true)}
      />
      
      {schoolModalOpen && usuario && (
        <SchoolModal 
          usuario={usuario} 
          setOpen={setSchoolModalOpen} 
          onSucesso={carregarUsuarioCompleto}
        />
      )}
      
      {modalDetalhesOpen && <ModalDetalhes simulado={simuladoSelecionado} setOpen={setModalDetalhesOpen} iniciar={iniciarSimuladoReal} loading={loadingSimulado} />}
      {modalPremiumOpen && <ModalPremium setOpen={setModalPremiumOpen} />}

      {telaAtual === "home" && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
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