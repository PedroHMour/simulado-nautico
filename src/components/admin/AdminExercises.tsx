import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, X, Anchor, Ship, Target, LifeBuoy, Flame, AlertTriangle, Zap, Compass, Lock, School, Globe, Edit3 } from "lucide-react";
import { ExerciseTopicDB, Usuario } from "@/types";

const ICON_MAP: Record<string, React.ReactNode> = {
    'Ship': <Ship size={24} />, 'Anchor': <Anchor size={24} />, 'Target': <Target size={24} />,
    'LifeBuoy': <LifeBuoy size={24} />, 'Flame': <Flame size={24} />, 'AlertTriangle': <AlertTriangle size={24} />,
    'Zap': <Zap size={24} />, 'Compass': <Compass size={24} />
};

const COLOR_MAP = [
    { label: 'Azul', value: 'bg-blue-100 text-blue-600' },
    { label: 'Vermelho', value: 'bg-red-100 text-red-600' },
    { label: 'Amarelo', value: 'bg-yellow-100 text-yellow-700' },
    { label: 'Verde', value: 'bg-emerald-100 text-emerald-600' },
    { label: 'Roxo', value: 'bg-purple-100 text-purple-600' },
    { label: 'Cinza', value: 'bg-gray-100 text-gray-600' },
];

interface AdminExercisesProps {
    usuario: Usuario;
}

export const AdminExercises = ({ usuario }: AdminExercisesProps) => {
  const [topics, setTopics] = useState<ExerciseTopicDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic_tag: "",
    icon_name: "Ship",
    color_class: "bg-blue-100 text-blue-600"
  });

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('exercise_topics').select('*').order('created_at', { ascending: false });
    
    // Admin Geral vê tudo. Escola vê os Globais (null) + os Dela.
    if (usuario.school_id) {
        query = query.or(`school_id.is.null,school_id.eq.${usuario.school_id}`);
    } else {
        query = query.is('school_id', null);
    }

    const { data } = await query;
    if (data) setTopics(data as ExerciseTopicDB[]);
    setLoading(false);
  }, [usuario.school_id]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Cria o tópico vinculado à escola (ou Global se for Admin Geral)
      const payload = {
          ...formData,
          school_id: usuario.school_id || null, 
          active: true
      };

      const { error } = await supabase.from('exercise_topics').insert([payload]);
      if (error) throw error;
      
      alert("Tópico criado com sucesso!");
      setIsEditing(false);
      setFormData({ title: "", description: "", topic_tag: "", icon_name: "Ship", color_class: "bg-blue-100 text-blue-600" });
      fetchTopics();
    } catch (error) {
       const msg = error instanceof Error ? error.message : "Erro desconhecido";
       alert("Erro ao salvar: " + msg);
    }
  };

  const handleDelete = async (topic: ExerciseTopicDB) => {
    // Bloqueia escola de apagar tópico Global
    if (topic.school_id === null && usuario.school_id) {
        alert("Este é um tópico oficial do sistema. Você não pode apagá-lo.");
        return;
    }

    if(!confirm(`Tem certeza que deseja excluir "${topic.title}"?`)) return;
    await supabase.from('exercise_topics').delete().eq('id', topic.id);
    fetchTopics();
  };

  if (!isEditing) {
    return (
      <div className="max-w-6xl mx-auto p-6 animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Gerenciar Tópicos</h1>
            <p className="text-gray-500">
                {usuario.school_id ? "Crie tópicos extras para seus alunos." : "Gerencie os tópicos oficiais da plataforma."}
            </p>
          </div>
          <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all">
            <Plus size={20} /> Novo Tópico
          </button>
        </div>

        {loading ? <p className="text-center py-10 text-gray-500">Carregando catálogo...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.length === 0 && (
                  <div className="col-span-3 text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
                      <p className="text-gray-400">Nenhum tópico cadastrado.</p>
                      <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold hover:underline mt-2">Criar o primeiro</button>
                  </div>
              )}

              {topics.map(t => {
                  const isGlobal = t.school_id === null;
                  const canEdit = (usuario.school_id && !isGlobal) ? false : true;

                  return (
                    <div key={t.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isGlobal ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200 shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${t.color_class}`}>
                                {ICON_MAP[t.icon_name] || <Ship />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    {t.title}
                                    {isGlobal ? 
                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={10}/> Oficial</span> : 
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1"><School size={10}/> Escola</span>
                                    }
                                </h3>
                                <p className="text-xs text-gray-500 font-mono bg-slate-100 px-1 rounded inline-block mt-1">{t.topic_tag}</p>
                                <p className="text-xs text-gray-400 mt-1">{t.description}</p>
                            </div>
                        </div>
                        
                        {canEdit ? (
                            <button onClick={() => handleDelete(t)} className="text-gray-300 hover:text-red-500 p-2 transition-colors" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        ) : (
                            <div className="text-gray-300 p-2 cursor-help" title="Tópico Oficial (Não editável)">
                                <Lock size={18} />
                            </div>
                        )}
                    </div>
                  );
              })}
          </div>
        )}
      </div>
    );
  }

  // --- FORMULÁRIO ---
  return (
    <div className="max-w-xl mx-auto p-6 animate-in slide-in-from-bottom-4">
       <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Novo Tópico de Exercício</h2>
            <p className="text-sm text-gray-500">Isso criará um novo card na tela dos alunos.</p>
        </div>
        <button onClick={() => setIsEditing(false)} className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-100"><X size={24} /></button>
      </div>
      
      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-5">
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Tópico</label>
              <input type="text" required className="w-full text-gray-700 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: RIPEAM"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">CÓDIGO (Tag)</label>
              <p className="text-xs text-gray-500 mb-2">Código interno para vincular questões. Ex: RIPEAM, BALIZAMENTO.</p>
              <input type="text" required className="w-full text-gray-700 p-3 border rounded-lg bg-gray-50 font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: RIPEAM"
                value={formData.topic_tag} onChange={e => setFormData({...formData, topic_tag: e.target.value.toUpperCase().replace(/\s/g, '_')})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ícone</label>
                <div className="relative">
                    <select className="w-full text-gray-700 p-3 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.icon_name} onChange={e => setFormData({...formData, icon_name: e.target.value})}>
                        {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-gray-500">{ICON_MAP[formData.icon_name]}</div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cor</label>
                <select className="w-full text-gray-700 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.color_class} onChange={e => setFormData({...formData, color_class: e.target.value})}>
                    {COLOR_MAP.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>
          </div>

          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Curta</label>
              <input type="text" className="w-full text-gray-700 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Luzes, Marcas e Sinais Sonoros"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg mt-4 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${usuario.school_id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
            {usuario.school_id ? <School size={20}/> : <Globe size={20}/>}
            {usuario.school_id ? "Criar Card da Escola" : "Criar Card Oficial"}
          </button>
      </form>
    </div>
  );
};