"use client";

import React from "react";
import { X, Crown, CheckCircle, Target, Clock, ChevronRight, Loader2, Award, AlertTriangle, ArrowRight, XCircle } from "lucide-react";
import Image from "next/image";
import { SimuladoCardType, QuestionDB } from "@/types";

// --- MODAL PREMIUM ---
export const ModalPremium = ({ setOpen }: { setOpen: (v: boolean) => void }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer transition-opacity"
      onClick={handleOverlayClick}
    >
      <div className="bg-blue-950 text-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-blue-800 relative cursor-default animate-in zoom-in duration-200">
        <button 
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-50 bg-black/40 hover:bg-white/20 p-2 rounded-full transition-all text-gray-300 hover:text-white"
        >
          <X size={28} />
        </button>

        <div className="px-8 pb-8 pt-12 text-center">
          <div className="flex justify-center mb-6">
             <div className="bg-yellow-500 p-4 rounded-full shadow-lg shadow-yellow-500/20">
               <Crown size={48} className="text-white" />
             </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Garanta sua aprovação</h3>
          <p className="text-blue-200 text-sm mb-8">
            Invista no seu aprendizado e desbloqueie todas as funcionalidades.
          </p>
          
          <ul className="text-left space-y-3 mb-8 text-blue-100 text-sm mx-auto max-w-[85%]">
             <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-green-400 shrink-0"/> <span>Simulados Ilimitados</span></li>
             <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-green-400 shrink-0"/> <span>Todos os Exercícios</span></li>
             <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-green-400 shrink-0"/> <span>Sem Anúncios</span></li>
          </ul>

          <button 
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white transition-colors mb-3 shadow-lg"
            onClick={() => setOpen(false)}
          >
            Liberar Acesso Agora
          </button>
          <p className="text-xs text-blue-300">R$ 14,90 / semana</p>
        </div>
      </div>
    </div>
  );
};

// --- MODAL DETALHES ---
interface ModalDetalhesProps {
  simulado: SimuladoCardType | null;
  setOpen: (v: boolean) => void;
  iniciar: () => void;
  loading: boolean;
}

export const ModalDetalhes = ({ simulado, setOpen, iniciar, loading }: ModalDetalhesProps) => {
  if (!simulado) return null;
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 cursor-default relative">
        <button 
          onClick={() => setOpen(false)} 
          className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors text-white"
        >
          <X size={24} />
        </button>

        <div className="bg-blue-900 p-8 flex flex-col items-center text-white">
          <div className="bg-blue-800 p-4 rounded-full mb-4 ring-4 ring-blue-700 shadow-xl">
            {simulado.icon}
          </div>
          <h3 className="text-2xl font-bold text-center">{simulado.titulo}</h3>
          <span className="text-blue-300 font-mono text-sm mt-1 bg-blue-950/50 px-3 py-1 rounded-full">{simulado.sigla}</span>
        </div>
        
        <div className="p-6">
          <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
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
          
          <button 
            onClick={iniciar} 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Iniciar Simulado <ChevronRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- QUIZ RUNNER ---
interface QuizRunnerProps {
  questions: QuestionDB[];
  indicePergunta: number;
  respostasUsuario: number[]; 
  tempo: number;
  onResponder: (idx: number) => void;
  onProxima: () => void;
  onSair: () => void;
}

export const QuizRunner = ({
  questions, indicePergunta, respostasUsuario, tempo, onResponder, onProxima, onSair
}: QuizRunnerProps) => {
  const questaoAtual = questions[indicePergunta];
  if (!questaoAtual) return null;

  const respostaSelecionada = respostasUsuario[indicePergunta];
  const jaRespondeu = respostaSelecionada !== undefined;

  const formatTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const opcoes = [
    { letra: 'A', texto: questaoAtual.answer_a },
    { letra: 'B', texto: questaoAtual.answer_b },
    { letra: 'C', texto: questaoAtual.answer_c },
    { letra: 'D', texto: questaoAtual.answer_d },
    { letra: 'E', texto: questaoAtual.answer_e } 
  ].filter(op => op.texto && op.texto.trim() !== ""); 

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onSair} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕ Sair</button>
          <div className="h-6 w-px bg-gray-200"></div>
          <span className="text-blue-900 font-bold text-sm">Q.{indicePergunta + 1} / {questions.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold font-mono">
          <Clock size={16} /> {formatTempo(tempo)}
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 flex flex-col">
        {questaoAtual.image_url && (
          <div className="mb-6 w-full h-48 md:h-64 relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <Image src={questaoAtual.image_url} alt="img" fill className="object-contain" />
          </div>
        )}
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 leading-relaxed">{questaoAtual.text}</h2>
        <div className="space-y-3">
          {opcoes.map((opcao, idx) => {
            const isCorreta = questaoAtual.correct_answer === opcao.letra;
            let estilo = "bg-white border-gray-200 text-gray-700";
            let icone = <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-sm flex items-center justify-center border border-gray-200">{opcao.letra}</div>;
            
            if (jaRespondeu) {
              if (isCorreta) {
                estilo = "bg-green-50 border-green-500 text-green-800 ring-1 ring-green-500";
                icone = <CheckCircle className="text-green-600" size={32} />;
              } else if (idx === respostaSelecionada) {
                estilo = "bg-red-50 border-red-500 text-red-800";
                icone = <XCircle className="text-red-600" size={32} />;
              } else {
                estilo = "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
              }
            }

            return (
              <button
                key={opcao.letra}
                disabled={jaRespondeu}
                onClick={() => onResponder(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${estilo}`}
              >
                {icone} <span className="font-medium text-sm md:text-base">{opcao.texto}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4 max-w-3xl mx-auto w-full">
          <button 
            onClick={onProxima}
            disabled={!jaRespondeu}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${jaRespondeu ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-400'}`}
          >
            {indicePergunta < questions.length - 1 ? "Próxima Questão" : "Finalizar Simulado"} <ArrowRight />
          </button>
      </div>
    </div>
  );
};

// --- RESULT VIEW ---
interface ResultViewProps {
  acertos: number;
  total: number;
  tempo: number;
  onRestart: () => void;
}

export const ResultView = ({ acertos, total, tempo, onRestart }: ResultViewProps) => {
  const formatarTempo = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const aprovado = acertos >= (total / 2);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center animate-in zoom-in duration-300">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${aprovado ? 'bg-green-100' : 'bg-red-100'}`}>
          {aprovado ? <Award size={48} className="text-green-600" /> : <AlertTriangle size={48} className="text-red-600" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulado Finalizado!</h2>
        <p className="text-gray-500 mb-6">Você acertou <strong className={aprovado ? "text-green-600" : "text-red-600"}>{acertos}</strong> de <strong>{total}</strong> questões.</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-400 uppercase font-bold text-[10px]">Aproveitamento</p>
            <p className="font-bold text-xl text-gray-800">{total > 0 ? Math.round((acertos/total)*100) : 0}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-400 uppercase font-bold text-[10px]">Tempo Total</p>
            <p className="font-mono text-xl text-gray-800">{formatarTempo(tempo)}</p>
          </div>
        </div>
        <button onClick={onRestart} className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 shadow-lg">Voltar ao Início</button>
      </div>
    </div>
  );
};