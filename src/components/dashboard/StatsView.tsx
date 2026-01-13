import React, { useEffect, useState } from "react";
import { Award, AlertTriangle, BarChart3, Ship, Loader2, History } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StatData {
  id: string;
  score: number;
  total_questions: number;
  created_at: string;
  category: string;
}

export const StatsView = () => {
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<StatData[]>([]);
  const [media, setMedia] = useState(0);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      if (data) {
        setHistorico(data);
        const totalSimulados = data.length;
        if (totalSimulados > 0) {
          const somaPorcentagens = data.reduce((acc, curr) => {
            return acc + (curr.score / curr.total_questions) * 100;
          }, 0);
          setMedia(Math.round(somaPorcentagens / totalSimulados));
        }
      }
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-900"/></div>;

  if (historico.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300">
          <History className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-700">Sem dados ainda</h3>
          <p className="text-gray-500">Faça seu primeiro simulado para ver suas estatísticas aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Suas Estatísticas</h2>
      
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-blue-400" />
          <h3 className="font-bold">Evolução de Desempenho</h3>
        </div>
        
        <div className="h-40 flex items-end gap-2 justify-between px-2 pt-4">
          {historico.map((item) => {
            const porcentagem = Math.round((item.score / item.total_questions) * 100);
            const aprovado = porcentagem >= 50;
            
            return (
              <div key={item.id} className="w-full bg-gray-800 rounded-t-sm relative group h-full flex items-end flex-1 mx-1 cursor-pointer">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-10">
                  {item.category}: {porcentagem}%
                </div>
                
                <div 
                  className={`w-full rounded-t-sm transition-all duration-1000 ease-out ${aprovado ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ height: `${porcentagem}%` }}
                ></div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 border-t border-gray-800 pt-2">
          <span>Primeiro</span>
          <span>Último</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-sm font-bold mb-2 flex items-center gap-2">
            <Award size={16} className="text-yellow-500"/> Média Geral
          </p>
          <span className={`text-4xl font-bold ${media >= 50 ? 'text-green-600' : 'text-red-500'}`}>
            {media}%
          </span>
          <p className="text-xs text-gray-400 mt-1">{historico.length} simulados feitos</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <p className="text-gray-400 text-sm font-bold mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-blue-500"/> Último Resultado
          </p>
          <Ship size={32} className="text-blue-100 mb-2 absolute opacity-20 -right-2 top-2" />
          <span className="text-3xl font-bold text-gray-800">
             {Math.round((historico[historico.length - 1].score / historico[historico.length - 1].total_questions) * 100)}%
          </span>
          <span className="text-xs text-gray-400 font-medium uppercase mt-1">
            {historico[historico.length - 1].category}
          </span>
        </div>
      </div>
    </div>
  );
};