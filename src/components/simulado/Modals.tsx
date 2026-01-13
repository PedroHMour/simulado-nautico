"use client";
import React from "react";
import { X, Crown, CheckCircle, Target, Clock, ChevronRight, Loader2 } from "lucide-react";
import { SimuladoCardType } from "@/types";

// --- MODAL PREMIUM ---
export const ModalPremium = ({ setOpen }: { setOpen: (v: boolean) => void }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
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
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
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
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Iniciar Simulado <ChevronRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};