import React from "react";
import { Home, Anchor, BookOpen, BarChart2, User } from "lucide-react";
import { TelaTipo } from "@/types";

interface MobileNavProps {
  // Atualiza a tipagem para incluir as novas telas
  telaAtual: TelaTipo | "apostilas" | "admin_questoes" | "admin_alunos" | "perfil";
  setTelaAtual: (t: any) => void;
}

export const MobileNav = ({ telaAtual, setTelaAtual }: MobileNavProps) => {
  
  const getIconClass = (nomeTela: string) => 
    telaAtual === nomeTela 
      ? "text-blue-900" 
      : "text-gray-400 hover:text-blue-600";

  const getBgClass = (nomeTela: string) =>
    telaAtual === nomeTela
      ? "bg-blue-50" 
      : "bg-transparent";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        
        <button 
          onClick={() => setTelaAtual("home")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${getIconClass("home")}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${getBgClass("home")}`}>
            <Home size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold">Início</span>
        </button>

        <button 
          onClick={() => setTelaAtual("exercicios")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${getIconClass("exercicios")}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${getBgClass("exercicios")}`}>
            <Anchor size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold">Treino</span>
        </button>

        <button 
          onClick={() => setTelaAtual("apostilas")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${getIconClass("apostilas")}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${getBgClass("apostilas")}`}>
            <BookOpen size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold">Apostilas</span>
        </button>

        <button 
          onClick={() => setTelaAtual("estatisticas")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${getIconClass("estatisticas")}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${getBgClass("estatisticas")}`}>
            <BarChart2 size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold">Desempenho</span>
        </button>

        <button 
          onClick={() => setTelaAtual("perfil")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${getIconClass("perfil")}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${getBgClass("perfil")}`}>
            <User size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold">Perfil</span>
        </button>

      </div>
    </div>
  );
};