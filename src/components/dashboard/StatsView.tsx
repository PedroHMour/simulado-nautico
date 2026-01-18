"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Loader2, History, TrendingUp, BookOpen, Anchor } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StatData {
  id: string;
  score: number;
  total_questions: number;
  created_at: string;
  category: string;
}

// AGORA RECEBE O ID PRONTO DO PAI
export const StatsView = ({ user_id }: { user_id?: string }) => {
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<StatData[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'simulados' | 'exercicios'>('simulados');

  useEffect(() => {
    // BLINDAGEM: Se não tem ID, para o loading na hora.
    if (!user_id) {
        setLoading(false);
        return;
    }
    carregarEstatisticas(user_id);
  }, [user_id]);

  const carregarEstatisticas = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setHistorico(data);
    } catch (err) {
      console.error("Erro stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-900" size={40}/></div>;

  if (historico.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center animate-in fade-in">
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
          <History className="text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-700">Sem dados ainda</h3>
          <p className="text-gray-500 mb-6">Complete um simulado ou exercício para ver sua evolução aqui.</p>
        </div>
      </div>
    );
  }

  // Filtros
  const categoriasSimulados = ['MTA', 'ARA', 'MSA', 'CPA'];
  const dadosSimulados = historico.filter(h => categoriasSimulados.includes(h.category));
  const dadosExercicios = historico.filter(h => !categoriasSimulados.includes(h.category));

  const dadosExibicao = abaAtiva === 'simulados' ? dadosSimulados : dadosExercicios;

  const calcularMedia = (lista: StatData[]) => {
    if (lista.length === 0) return 0;
    const soma = lista.reduce((acc, curr) => acc + (curr.score / curr.total_questions) * 100, 0);
    return Math.round(soma / lista.length);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32 animate-in fade-in duration-500">
      
      {/* ABAS */}
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full mb-8">
        <button onClick={() => setAbaAtiva('simulados')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${abaAtiva === 'simulados' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Anchor size={18} /> Simulados
        </button>
        <button onClick={() => setAbaAtiva('exercicios')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${abaAtiva === 'exercicios' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <BookOpen size={18} /> Exercícios
        </button>
      </div>

      {/* CARD DE MÉDIA */}
      <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between mb-8">
          <div>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Média Geral ({abaAtiva})</p>
              <h3 className="text-5xl font-black">{calcularMedia(dadosExibicao)}%</h3>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
            <TrendingUp size={14} className="text-green-400" />
            <span>{dadosExibicao.length} atividades realizadas</span>
          </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2 ml-1">
            <BarChart3 size={16} className="text-blue-600" /> Histórico
        </h4>
        
        {dadosExibicao.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm font-medium italic">Nenhum dado nesta categoria.</div>
        ) : (
            dadosExibicao.map((item) => {
                const perc = Math.round((item.score / item.total_questions) * 100);
                const aprovado = perc >= 50;
                return (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${aprovado ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{perc}%</div>
                                <div>
                                    <h5 className="font-bold text-gray-800 text-sm">{item.category === 'MTA' ? 'Motonauta' : item.category === 'ARA' ? 'Arrais' : item.category}</h5>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${aprovado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{aprovado ? 'Aprovado' : 'Reprovado'}</div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${aprovado ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${perc}%` }} /></div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};