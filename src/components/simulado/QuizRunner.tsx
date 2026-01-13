import React from "react";
import { X, Loader2 } from "lucide-react";
import { QuestionDB } from "@/types";

interface QuizRunnerProps {
  questions: QuestionDB[];
  indicePergunta: number;
  respostasUsuario: number[];
  tempo: number;
  onResponder: (idx: number) => void;
  onProxima: () => void;
  onSair: () => void;
}

export const QuizRunner = ({ questions, indicePergunta, respostasUsuario, tempo, onResponder, onProxima, onSair }: QuizRunnerProps) => {
  // Formata o tempo
  const formatarTempo = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  
  const questaoAtual = questions[indicePergunta];

  if (!questaoAtual) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-900" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans fixed inset-0 z-50 overflow-y-auto">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <button onClick={onSair} className="text-gray-500 text-sm font-medium hover:text-red-600 flex items-center gap-1 transition-colors">
          <X size={18}/> <span className="hidden sm:inline">Sair</span>
        </button>
        <span className="font-mono font-bold text-blue-900 text-lg bg-blue-50 px-3 py-1 rounded-lg">
          {formatarTempo(tempo)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-600 transition-all duration-300" 
          style={{ width: `${((indicePergunta + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col justify-center">
        <div className="mb-6">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full w-fit">
            Questão {indicePergunta + 1} de {questions.length}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
          {questaoAtual.text}
        </h2>
        
        {/* Imagem da Questão */}
        {questaoAtual.image_url && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={questaoAtual.image_url} 
              alt="Questão Ilustrativa" 
              className="w-full h-auto max-h-60 object-contain bg-gray-50" 
            />
          </div>
        )}

        <div className="space-y-3">
          {questaoAtual.answers.map((ans, idx) => (
            <button 
              key={ans.id} 
              onClick={() => onResponder(idx)} 
              className={`w-full p-4 rounded-xl text-left border-2 transition-all duration-200 hover:border-blue-300
                ${respostasUsuario[indicePergunta] === idx 
                  ? "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-md" 
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
                {ans.text}
            </button>
          ))}
        </div>

        <button 
          onClick={onProxima} 
          disabled={respostasUsuario[indicePergunta] === undefined} 
          className="mt-8 w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {indicePergunta === questions.length - 1 ? "Finalizar Prova" : "Próxima Questão"}
        </button>
      </main>
    </div>
  );
};