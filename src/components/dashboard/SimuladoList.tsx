import React from "react";
import { ChevronRight } from "lucide-react";
import { SimuladoCardType } from "@/types";

interface SimuladoListProps {
  simulados: SimuladoCardType[];
  onSelect: (simulado: SimuladoCardType) => void;
}

export const SimuladoList = ({ simulados, onSelect }: SimuladoListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {simulados.map((simulado) => (
        <div 
          key={simulado.id} 
          onClick={() => onSelect(simulado)} 
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-all active:scale-[0.98] group"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors text-blue-900">
            {simulado.icon}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800 text-lg">{simulado.titulo}</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full h-fit">
                {simulado.sigla}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{simulado.subtitulo}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">Q: {simulado.questoes}</span>
              <span className="flex items-center gap-1">T: {simulado.tempo}</span>
            </div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-blue-500" />
        </div>
      ))}
    </div>
  );
};