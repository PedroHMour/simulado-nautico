"use client"; // Garante que o componente rode no cliente para evitar erros de hidratação no mobile

import React from "react";
import { Home, Anchor, BookOpen, BarChart3, User } from "lucide-react"; // Trocado BarChart2 por BarChart3 para alinhar com o StatsView
import { TelaTipo } from "@/types";

interface MobileNavProps {
  telaAtual: TelaTipo;
  setTelaAtual: (t: TelaTipo) => void;
}

export const MobileNav = ({ telaAtual, setTelaAtual }: MobileNavProps) => {
  
  const getIconClass = (nomeTela: string) => 
    telaAtual === nomeTela 
      ? "text-blue-900" 
      : "text-gray-400";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        
        {/* Botão Início */}
        <button 
          onClick={() => setTelaAtual("home")} 
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${getIconClass("home")}`}
        >
          <Home size={22} strokeWidth={telaAtual === "home" ? 2.5 : 2} />
          <span className={`text-[10px] mt-1 ${telaAtual === "home" ? "font-black" : "font-medium"}`}>Início</span>
        </button>

        {/* Botão Exercícios */}
        <button 
          onClick={() => setTelaAtual("exercicios")} 
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${getIconClass("exercicios")}`}
        >
          <Anchor size={22} strokeWidth={telaAtual === "exercicios" ? 2.5 : 2} />
          <span className={`text-[10px] mt-1 ${telaAtual === "exercicios" ? "font-black" : "font-medium"}`}>Praticar</span>
        </button>

        {/* Botão Apostilas */}
        <button 
          onClick={() => setTelaAtual("apostilas")} 
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${getIconClass("apostilas")}`}
        >
          <BookOpen size={22} strokeWidth={telaAtual === "apostilas" ? 2.5 : 2} />
          <span className={`text-[10px] mt-1 ${telaAtual === "apostilas" ? "font-black" : "font-medium"}`}>Material</span>
        </button>

        {/* Botão Desempenho - Importante: Verifique se o nome "estatisticas" bate com o seu page.tsx */}
        <button 
          onClick={() => setTelaAtual("estatisticas")} 
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${getIconClass("estatisticas")}`}
        >
          <BarChart3 size={22} strokeWidth={telaAtual === "estatisticas" ? 2.5 : 2} />
          <span className={`text-[10px] mt-1 ${telaAtual === "estatisticas" ? "font-black" : "font-medium"}`}>Evolução</span>
        </button>

        {/* Botão Perfil */}
        <button 
          onClick={() => setTelaAtual("perfil")} 
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${getIconClass("perfil")}`}
        >
          <User size={22} strokeWidth={telaAtual === "perfil" ? 2.5 : 2} />
          <span className={`text-[10px] mt-1 ${telaAtual === "perfil" ? "font-black" : "font-medium"}`}>Perfil</span>
        </button>

      </div>
    </div>
  );
};