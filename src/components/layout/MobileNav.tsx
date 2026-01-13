import React from "react";
import { Anchor, Target, BarChart3 } from "lucide-react";
import { TelaTipo } from "@/types";

interface MobileNavProps {
  telaAtual: TelaTipo;
  setTelaAtual: (t: TelaTipo) => void;
}

export const MobileNav = ({ telaAtual, setTelaAtual }: MobileNavProps) => {
  const btnClass = (active: boolean) => 
    `flex flex-col items-center p-2 transition-colors ${active ? 'text-blue-900' : 'text-gray-400'}`;

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button onClick={() => setTelaAtual("home")} className={btnClass(telaAtual === 'home')}>
        <Anchor size={24} /> 
        <span className="text-[10px] font-bold mt-1">Simulados</span>
      </button>
      <button onClick={() => setTelaAtual("exercicios")} className={btnClass(telaAtual === 'exercicios')}>
        <Target size={24} /> 
        <span className="text-[10px] font-medium mt-1">Exercícios</span>
      </button>
      <button onClick={() => setTelaAtual("estatisticas")} className={btnClass(telaAtual === 'estatisticas')}>
        <BarChart3 size={24} /> 
        <span className="text-[10px] font-medium mt-1">Estatísticas</span>
      </button>
    </nav>
  );
};