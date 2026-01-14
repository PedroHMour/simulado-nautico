import React from "react";
import Image from "next/image";
import { Clock, ArrowRight, CheckCircle, XCircle } from "lucide-react"; // Anchor removido
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

export const QuizRunner = ({
  questions,
  indicePergunta,
  respostasUsuario,
  tempo,
  onResponder,
  onProxima,
  onSair
}: QuizRunnerProps) => {
  
  const questaoAtual = questions[indicePergunta];
  if (!questaoAtual) return <div className="p-8 text-center">Carregando questão...</div>;

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
  ].filter(op => op.texto); 

  const isCorreta = (letra: string) => questaoAtual.correct_answer === letra;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onSair} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕ Sair</button>
          <div className="h-6 w-px bg-gray-200"></div>
          <span className="text-blue-900 font-bold text-sm">Q.{indicePergunta + 1} <span className="text-gray-400 font-normal">/ {questions.length}</span></span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold font-mono">
          <Clock size={16} /> {formatTempo(tempo)}
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 flex flex-col">
        
        {questaoAtual.image_url && (
          <div className="mb-6 w-full h-48 md:h-64 relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <Image 
              src={questaoAtual.image_url} 
              alt="Imagem da Questão" 
              fill 
              className="object-contain"
            />
          </div>
        )}

        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 leading-relaxed">
          {questaoAtual.text}
        </h2>

        <div className="space-y-3">
          {opcoes.map((opcao, idx) => {
            let estiloBotao = "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50";
            let icone = <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-sm flex items-center justify-center border border-gray-200">{opcao.letra}</div>;
            
            if (jaRespondeu) {
              if (isCorreta(opcao.letra)) {
                 estiloBotao = "bg-green-50 border-green-500 text-green-800 ring-1 ring-green-500";
                 icone = <CheckCircle className="text-green-600" size={32} />;
              } else if (idx === respostaSelecionada) {
                 estiloBotao = "bg-red-50 border-red-500 text-red-800";
                 icone = <XCircle className="text-red-600" size={32} />;
              } else {
                 estiloBotao = "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
              }
            }

            return (
              <button
                key={opcao.letra}
                disabled={jaRespondeu}
                onClick={() => onResponder(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${estiloBotao} ${!jaRespondeu ? 'active:scale-[0.98]' : ''}`}
              >
                <div className="shrink-0"> 
                  {icone}
                </div>
                <span className="font-medium text-sm md:text-base">{opcao.texto}</span>
              </button>
            );
          })}
        </div>

      </div>

      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 md:relative md:bg-transparent md:border-0 md:p-0 mt-4">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={onProxima}
            disabled={!jaRespondeu}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${jaRespondeu ? 'bg-blue-900 text-white hover:bg-blue-800 hover:shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {indicePergunta < questions.length - 1 ? "Próxima Questão" : "Finalizar Simulado"} 
            <ArrowRight />
          </button>
        </div>
      </div>

    </div>
  );
};