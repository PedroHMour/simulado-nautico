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

// CORREÇÃO: Recebe o ID do usuário do pai (page.tsx)
export const StatsView = ({ user_id }: { user_id?: string }) => {
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<StatData[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'simulados' | 'exercicios'>('simulados');

  useEffect(() => {
    // Se o ID vier, carrega. Se não, para o loading para não travar a tela branca.
    if (user_id) {
        carregarEstatisticas(user_id);
    } else {
        setLoading(false);
    }
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

  if (loading) return (
    <div className="flex justify-center items-center p-20">
      <Loader2 className="animate-spin text-blue-900" size={40}/>
    </div>
  );

  if (historico.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center animate-in fade-in">
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
          <History className="text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-700">Ainda não há dados</h3>
          <p className="text-gray-500 mb-6">Complete um simulado ou exercício para ver sua evolução aqui.</p>
        </div>
      </div>
    );
  }

  // Separação de Dados
  const categoriasSimulados = ['MTA', 'ARA', 'MSA', 'CPA'];
  const dadosSimulados = historico.filter(h => categoriasSimulados.includes(h.category));
  const dadosExercicios = historico.filter(h => !categoriasSimulados.includes(h.category));

  const calcularMedia = (lista: StatData[]) => {
    if (lista.length === 0) return 0;
    const soma = lista.reduce((acc, curr) => acc + (curr.score / curr.total_questions) * 100, 0);
    return Math.round(soma / lista.length);
  };

  const getDestaqueMelhor = (lista: StatData[]) => {
    if (lista.length === 0) return null;
    return lista.reduce((prev, current) => 
        (current.score / current.total_questions) > (prev.score / prev.total_questions) ? current : prev
    );
  };

  const dadosExibicao = abaAtiva === 'simulados' ? dadosSimulados : dadosExercicios;
  const melhorPerformance = getDestaqueMelhor(dadosExibicao);

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

      {/* HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
              <div>
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Média Geral ({abaAtiva})</p>
                  <h3 className="text-5xl font-black">{calcularMedia(dadosExibicao)}%</h3>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                <TrendingUp size={14} className="text-green-400" />
                <span>{dadosExibicao.length} atividades realizadas</span>
              </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              {melhorPerformance ? (
                <>
                  <div>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Melhor Resultado</p>
                      <h3 className="text-3xl font-black text-gray-800">{Math.round((melhorPerformance.score / melhorPerformance.total_questions) * 100)}%</h3>
                      <p className="text-sm font-bold text-blue-600 mt-1">{melhorPerformance.category}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                      <History size={12} />
                      {new Date(melhorPerformance.created_at).toLocaleDateString()}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 font-medium italic">Sem registros</div>
              )}
          </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2 ml-1">
            <BarChart3 size={16} className="text-blue-600" /> Histórico de Progresso
        </h4>
        
        {dadosExibicao.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm font-medium italic">Nenhum dado para mostrar nesta aba.</div>
        ) : (
            dadosExibicao.map((item) => {
                const perc = Math.round((item.score / item.total_questions) * 100);
                const aprovado = perc >= 50;
                
                return (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm hover:border-blue-100 transition-colors group">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${aprovado ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {perc}%
                                </div>
                                <div>
                                    <h5 className="font-bold text-gray-800 text-sm">{item.category}</h5>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${aprovado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {aprovado ? 'Aprovado' : 'Abaixo da Média'}
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${aprovado ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${perc}%` }}
                            />
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};