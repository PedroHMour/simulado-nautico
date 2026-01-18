import React, { useEffect, useState } from "react";
import { Award, AlertTriangle, BarChart3, Ship, Loader2, History, TrendingUp } from "lucide-react";
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
      console.error("Erro stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-900"/></div>;

  if (historico.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center animate-in fade-in">
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
          <History className="text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-700">Sem dados ainda</h3>
          <p className="text-gray-500 mb-6">Faça seu primeiro simulado para ver sua evolução.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-3 mb-6">
         <div className="p-3 bg-blue-100 rounded-xl text-blue-900"><BarChart3 size={24} /></div>
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Desempenho</h2>
            <p className="text-gray-500 text-sm">Sua evolução nos últimos simulados.</p>
         </div>
      </div>
      
      {/* GRÁFICO MODERNO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><TrendingUp size={16} /> Histórico Recente</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Últimos 20</span>
        </div>

        <div className="h-48 relative flex items-end justify-between gap-2 px-2">
          {/* Linhas de Grade */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between text-xs text-gray-300 font-mono">
             <div className="border-b border-gray-100 w-full h-0 relative"><span className="absolute -top-3 right-0">100%</span></div>
             <div className="border-b border-dashed border-gray-200 w-full h-0 relative"><span className="absolute -top-3 right-0 text-blue-300 font-bold">50%</span></div>
             <div className="border-b border-gray-100 w-full h-0 relative"><span className="absolute -top-3 right-0">0%</span></div>
          </div>

          {historico.map((item) => {
            const porcentagem = Math.round((item.score / item.total_questions) * 100);
            const aprovado = porcentagem >= 50;
            
            return (
              <div key={item.id} className="w-full h-full flex items-end relative group">
                {/* Tooltip Hover */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-bold whitespace-nowrap z-10 shadow-xl pointer-events-none mb-2">
                  {item.category}: {porcentagem}%
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
                
                {/* A Barra (Classe corrigida aqui) */}
                <div 
                  className={`w-full rounded-t-lg transition-all duration-700 ease-out hover:opacity-80 relative ${aprovado ? 'bg-linear-to-t from-green-500 to-green-400' : 'bg-linear-to-t from-red-500 to-red-400'}`}
                  style={{ height: `${porcentagem}%` }}
                >
                    <div className="w-full h-1 bg-white/30 absolute top-0 rounded-t-lg"></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center text-xs text-gray-400 mt-4 font-medium uppercase tracking-wider">Linha do Tempo</div>
      </div>

      {/* CARDS INFORMATIVOS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-xs uppercase font-bold mb-2 tracking-wide flex items-center gap-1">
            <Award size={14} className="text-yellow-500"/> Média Geral
          </p>
          <span className={`text-4xl font-bold tracking-tight ${media >= 50 ? 'text-green-600' : 'text-red-500'}`}>
            {media}%
          </span>
          <p className="text-xs text-gray-400 mt-1">{historico.length} provas</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <p className="text-gray-400 text-xs uppercase font-bold mb-2 tracking-wide flex items-center gap-1">
            <AlertTriangle size={14} className="text-blue-500"/> Último
          </p>
          <Ship size={48} className="text-blue-50 mb-2 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-bold text-gray-800 z-10">
             {Math.round((historico[historico.length - 1].score / historico[historico.length - 1].total_questions) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};