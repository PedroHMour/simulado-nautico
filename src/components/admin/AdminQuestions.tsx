import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Plus, Trash2, Save, X, ImageIcon, Filter, AlertCircle } from "lucide-react";
import { QuestionDB, ExerciseTopicDB } from "@/types";

export const AdminQuestions = () => {
  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [topics, setTopics] = useState<ExerciseTopicDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showOptionE, setShowOptionE] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  const [formData, setFormData] = useState({
    category: "ARA", 
    topic: "", 
    text: "",
    image_url: "",
    answer_a: "",
    answer_b: "",
    answer_c: "",
    answer_d: "",
    answer_e: "",
    correct_answer: "A"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: qData } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (qData) setQuestions(qData as QuestionDB[]);

    const { data: tData } = await supabase.from('exercise_topics').select('*').eq('active', true).order('title');
    if (tData) setTopics(tData as ExerciseTopicDB[]);
    setLoading(false);
  };

  const handleNew = () => {
      if (topics.length === 0) {
          alert("PARE: Você precisa ir em 'Exercícios' e criar uma Categoria (Card) primeiro.");
          return;
      }
      setFormData({ 
          category: "ARA", 
          topic: topics[0].topic_tag,
          text: "", image_url: "", 
          answer_a: "", answer_b: "", answer_c: "", answer_d: "", answer_e: "", 
          correct_answer: "A" 
      });
      setShowOptionE(false);
      setIsEditing(true);
      setStatusMsg("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setStatusMsg("Enviando imagem...");
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error } = await supabase.storage.from('questions').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('questions').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      setStatusMsg("Imagem carregada!");
    } catch { 
      alert("Erro ao enviar imagem. Verifique se o Bucket 'questions' existe e é público.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("Salvando...");

    if (!formData.topic) {
        alert("ERRO: O campo 'Categoria' está vazio. Selecione um card (Ex: RIPEAM).");
        setStatusMsg("Erro: Selecione uma categoria.");
        return;
    }
    if (!formData.text) {
        alert("ERRO: O enunciado da questão está vazio.");
        setStatusMsg("Erro: Digite a pergunta.");
        return;
    }

    try {
      const finalAnswerE = (showOptionE && formData.answer_e.trim() !== "") ? formData.answer_e : null;
      
      const payload = { 
          ...formData, 
          answer_e: finalAnswerE, 
          active: true 
      };

      const { error } = await supabase.from('questions').insert([payload]);

      if (error) {
          console.error("Erro Supabase:", error);
          throw error;
      }
      
      alert("✅ Questão Salva com Sucesso!");
      setIsEditing(false);
      fetchData();
    } catch (error) {
       const msg = error instanceof Error ? error.message : "Erro desconhecido";
       alert("❌ ERRO AO SALVAR NO BANCO:\n" + msg + "\n\nDica: Você rodou o comando SQL para criar a coluna 'topic'?");
       setStatusMsg("Erro ao salvar.");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Apagar questão?")) return;
    await supabase.from('questions').delete().eq('id', id);
    fetchData();
  };

  const toggleOptionE = () => {
      if (showOptionE) setFormData(prev => ({ ...prev, answer_e: "", correct_answer: prev.correct_answer === 'E' ? 'A' : prev.correct_answer }));
      setShowOptionE(!showOptionE);
  };

  if (!isEditing) {
    return (
      <div className="max-w-6xl mx-auto p-6 animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Banco de Questões</h1>
            <p className="text-gray-500">{questions.length} questões cadastradas.</p>
          </div>
          <button onClick={handleNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md">
            <Plus size={20} /> Nova Questão
          </button>
        </div>

        {topics.length === 0 && !loading && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-800">
                <AlertCircle size={24} />
                <div>
                    <h3 className="font-bold">Sistema Travado: Falta Categoria!</h3>
                    <p className="text-sm">Vá no menu &quot;Exercícios&quot; e crie pelo menos um card (ex: RIPEAM) para destravar o cadastro.</p>
                </div>
            </div>
        )}

        {loading ? <p className="text-center py-10">Carregando...</p> : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Questão</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Simulado</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4">
                        <div className="flex items-start gap-3">
                            {q.image_url && <div className="w-10 h-10 relative shrink-0 rounded bg-gray-100"><Image src={q.image_url} alt="img" fill className="object-cover rounded" /></div>}
                            <span className="text-sm text-gray-800 font-medium line-clamp-2">{q.text}</span>
                        </div>
                    </td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">{q.category}</span></td>
                    <td className="p-4 text-sm">
                        {q.topic ? (
                            <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                {topics.find(t => t.topic_tag === q.topic)?.title || q.topic}
                            </span>
                        ) : <span className="text-red-500 text-xs font-bold">SEM CATEGORIA</span>}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(q.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // --- FORMULÁRIO ---
  return (
    <div className="max-w-3xl mx-auto p-6 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Nova Questão</h2>
        <button onClick={() => setIsEditing(false)} className="bg-white p-2 rounded-full shadow-sm"><X size={24} /></button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
        
        {/* Status Bar */}
        {statusMsg && (
            <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-bold border border-blue-200">
                {statusMsg}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div>
                <label className="block text-sm font-bold text-blue-900 mb-1">1. Habilitação (Simulado)</label>
                <select 
                    className="w-full p-3 bg-white border border-blue-200 text-gray-900 rounded-lg outline-none font-medium focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    <option value="ARA">Arrais-Amador</option>
                    <option value="MTA">Motonauta</option>
                    <option value="MSA">Mestre-Amador</option>
                    <option value="CPA">Capitão-Amador</option>
                </select>
            </div>
            
            <div>
                <label className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                    <Filter size={16}/> 2. Categoria (Exercício)
                </label>
                <select 
                    required
                    className="w-full p-3 bg-white border border-blue-200 text-gray-900 rounded-lg outline-none font-medium focus:ring-2 focus:ring-blue-500"
                    value={formData.topic}
                    onChange={e => setFormData({...formData, topic: e.target.value})}
                >
                    <option value="" disabled>Selecione...</option>
                    {topics.map(t => (
                        <option key={t.id} value={t.topic_tag}>
                            {t.title}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Enunciado</label>
            <textarea 
                required 
                rows={3} 
                className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Digite a pergunta..." 
                value={formData.text} 
                onChange={e => setFormData({...formData, text: e.target.value})} 
            />
        </div>
        
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Imagem (Opcional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 cursor-pointer relative h-24 transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                {formData.image_url ? (
                    <div className="relative w-full h-full"><Image src={formData.image_url} alt="Preview" fill className="object-contain" /></div>
                ) : (
                    <div className="text-center text-gray-400"><ImageIcon className="mx-auto mb-1" size={20}/><span className="text-xs">Clique para adicionar foto</span></div>
                )}
            </div>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Alternativas</label>
                <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                    <span className="font-bold text-green-800">Correta:</span>
                    <select className="bg-transparent font-bold text-green-700 outline-none cursor-pointer" value={formData.correct_answer} onChange={e => setFormData({...formData, correct_answer: e.target.value})}>
                        {['A','B','C','D', showOptionE ? 'E' : ''].filter(Boolean).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
            
            {['A', 'B', 'C', 'D'].map((letra) => {
                const fieldName = `answer_${letra.toLowerCase()}` as keyof typeof formData;
                return (
                  <div key={letra} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formData.correct_answer === letra ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{letra}</div>
                      <input 
                          type="text" 
                          required={letra === 'A' || letra === 'B'} 
                          className="flex-1 p-3 rounded-lg outline-none border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 transition-all" 
                          placeholder={`Opção ${letra}`} 
                          value={formData[fieldName]} 
                          onChange={e => setFormData({...formData, [fieldName]: e.target.value})} 
                      />
                  </div>
                );
            })}

            {showOptionE ? (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-400">E</div>
                    <input 
                        type="text" 
                        required 
                        className="flex-1 p-3 rounded-lg outline-none border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 transition-all" 
                        placeholder="Opção E" 
                        value={formData.answer_e} 
                        onChange={e => setFormData({...formData, answer_e: e.target.value})} 
                    />
                    <button type="button" onClick={toggleOptionE} className="p-3 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                </div>
            ) : (
                <button type="button" onClick={toggleOptionE} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2 ml-11"><Plus size={14} /> Adicionar Opção E</button>
            )}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={uploading} className="px-8 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 shadow-lg flex items-center gap-2">
                <Save size={20} /> Salvar Questão
            </button>
        </div>
      </form>
    </div>
  );
};