import React from "react";
import { Award, AlertTriangle } from "lucide-react";

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
          {aprovado ? 
            <Award size={48} className="text-green-600" /> :
            <AlertTriangle size={48} className="text-red-600" />
          }
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulado Finalizado!</h2>
        <p className="text-gray-500 mb-6">
          Você acertou <strong className={aprovado ? "text-green-600" : "text-red-600"}>{acertos}</strong> de <strong>{total}</strong> questões.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-400 uppercase font-bold text-[10px]">Aproveitamento</p>
            <p className="font-bold text-xl text-gray-800">{Math.round((acertos/total)*100)}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-400 uppercase font-bold text-[10px]">Tempo Total</p>
            <p className="font-mono text-xl text-gray-800">{formatarTempo(tempo)}</p>
          </div>
        </div>

        <button 
          onClick={onRestart} 
          className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};