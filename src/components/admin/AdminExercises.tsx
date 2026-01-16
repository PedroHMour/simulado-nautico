import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, X, Anchor, Ship, Target, LifeBuoy, Flame, AlertTriangle, Zap, Compass } from "lucide-react";
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

  // Função movida para useCallback para ser usada no useEffect
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('exercise_topics').select('*').order('created_at', { ascending: false });
    
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
  }, [fetchTopics]); // Dependência adicionada

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
          ...formData,
          school_id: usuario.school_id,
          active: true
      };

      const { error } = await supabase.from('exercise_topics').insert([payload]);
      if (error) throw error;
      
      alert("Exercício criado com sucesso!");
      setIsEditing(false);
      setFormData({ title: "", description: "", topic_tag: "", icon_name: "Ship", color_class: "bg-blue-100 text-blue-600" });
      fetchTopics();
    } catch (error) {
       const msg = error instanceof Error ? error.message : "Erro desconhecido";
       alert("Erro ao salvar: " + msg);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    await supabase.from('exercise_topics').delete().eq('id', id);
    fetchTopics();
  };

  if (!isEditing) {
    return (
      <div className="max-w-5xl mx-auto p-6 animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Gerenciar Exercícios</h1>
            <p className="text-gray-500">Crie cards de revisão para os alunos.</p>
          </div>
          <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md">
            <Plus size={20} /> Novo Card
          </button>
        </div>

        {loading ? <p className="text-center py-10">Carregando...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${t.color_class}`}>
                              {ICON_MAP[t.icon_name] || <Ship />}
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-800">{t.title}</h3>
                              <p className="text-xs text-gray-500">Filtro: {t.topic_tag}</p>
                              {t.school_id ? 
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full">Da Escola</span> :
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 rounded-full">Padrão do Sistema</span>
                              }
                          </div>
                      </div>
                      {(t.school_id === usuario.school_id) && (
                          <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 p-2">
                              <Trash2 size={18} />
                          </button>
                      )}
                  </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 animate-in slide-in-from-bottom-4">
       <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Novo Card de Exercício</h2>
        <button onClick={() => setIsEditing(false)} className="bg-white p-2 rounded-full shadow-sm"><X size={24} /></button>
      </div>
      
      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-lg space-y-4">
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Título do Card</label>
              <input type="text" required className="w-full text-gray-700 p-3 border rounded-lg" placeholder="Ex: Revisão RIPEAM"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tag de Filtro (Topic)</label>
              <p className="text-xs text-gray-500 mb-1">Deve ser idêntico ao cadastrado nas questões.</p>
              <input type="text" required className="w-full text-gray-700 p-3 border rounded-lg" placeholder="Ex: RIPEAM"
                value={formData.topic_tag} onChange={e => setFormData({...formData, topic_tag: e.target.value.toUpperCase()})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ícone</label>
                <select className="w-full text-gray-700 p-3 border rounded-lg" value={formData.icon_name} onChange={e => setFormData({...formData, icon_name: e.target.value})}>
                    {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cor</label>
                <select className="w-full text-gray-700 p-3 border rounded-lg" value={formData.color_class} onChange={e => setFormData({...formData, color_class: e.target.value})}>
                    {COLOR_MAP.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>
          </div>

          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Curta</label>
              <input type="text" className="w-full text-gray-700 p-3 border rounded-lg" placeholder="Ex: 20 questões"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg mt-4">Criar Exercício</button>
      </form>
    </div>
  );
};