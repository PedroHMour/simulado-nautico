import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Plus, Trash2, Save, X, ImageIcon } from "lucide-react";
import { QuestionDB } from "@/types";

export const AdminQuestions = () => {
  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "ARA", 
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
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setQuestions(data as QuestionDB[]);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('questions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('questions').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      alert("Imagem carregada!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro no upload: " + msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
          ...formData,
          answer_e: formData.answer_e.trim() === "" ? null : formData.answer_e,
          topic: 'GERAL',
          active: true
      };

      const { error } = await supabase
        .from('questions')
        .insert([payload]);

      if (error) throw error;
      
      alert("Questão salva com sucesso!");
      setIsEditing(false);
      setFormData({ 
          category: "ARA", text: "", image_url: "", 
          answer_a: "", answer_b: "", answer_c: "", answer_d: "", answer_e: "", 
          correct_answer: "A" 
      });
      fetchQuestions();
    } catch (error) {
       const msg = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro ao salvar: " + msg);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir esta questão?")) return;
    await supabase.from('questions').delete().eq('id', id);
    fetchQuestions();
  };

  if (!isEditing) {
    return (
      <div className="max-w-5xl mx-auto p-6 animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Banco de Questões</h1>
            <p className="text-gray-500">Gerencie o conteúdo dos simulados.</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} /> Nova Questão
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">Carregando banco de dados...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Questão</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Cat.</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Gab.</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4">
                        <div className="flex items-start gap-3">
                            {q.image_url && (
                                <div className="w-12 h-12 relative shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                                    <Image src={q.image_url} alt="Questão" fill className="object-cover" />
                                </div>
                            )}
                            <span className="text-sm text-gray-800 font-medium line-clamp-2 max-w-xs">{q.text}</span>
                        </div>
                    </td>
                    <td className="p-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">
                            {q.category}
                        </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-green-600 pl-4">{q.correct_answer}</td>
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

  return (
    <div className="max-w-3xl mx-auto p-6 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Nova Questão</h2>
        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800 bg-white p-2 rounded-full shadow-sm"><X size={24} /></button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg outline-none font-medium"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    <option value="ARA">Arrais Amador</option>
                    <option value="MTA">Motonauta</option>
                    <option value="MSA">Mestre Amador</option>
                    <option value="CPA">Capitão Amador</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gabarito</label>
                <select 
                    className="w-full p-3 bg-green-50 border border-green-200 text-green-800 font-bold rounded-lg outline-none"
                    value={formData.correct_answer}
                    onChange={e => setFormData({...formData, correct_answer: e.target.value})}
                >
                    <option value="A">Alternativa A</option>
                    <option value="B">Alternativa B</option>
                    <option value="C">Alternativa C</option>
                    <option value="D">Alternativa D</option>
                    <option value="E">Alternativa E</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Imagem (Opcional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 cursor-pointer relative h-32">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />
                {formData.image_url ? (
                    <div className="relative w-full h-full">
                         <Image src={formData.image_url} alt="Preview" fill className="object-contain" />
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <ImageIcon className="mx-auto mb-1" />
                        <span className="text-xs">Carregar Foto</span>
                    </div>
                )}
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Enunciado</label>
            <textarea 
                required rows={3}
                className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg outline-none resize-none"
                placeholder="Digite a pergunta..."
                value={formData.text}
                onChange={e => setFormData({...formData, text: e.target.value})}
            />
        </div>

        {/* ALTERNATIVAS */}
        <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Alternativas</label>
            {['A', 'B', 'C', 'D', 'E'].map((letra) => {
                // CORREÇÃO: Criação da chave fortemente tipada para evitar erro TS
                const fieldName = `answer_${letra.toLowerCase()}` as keyof typeof formData;
                
                return (
                  <div key={letra} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formData.correct_answer === letra ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                          {letra}
                      </div>
                      <input 
                          type="text"
                          required={letra === 'A' || letra === 'B'}
                          className={`flex-1 p-3 rounded-lg outline-none transition-all font-medium ${
                              formData.correct_answer === letra 
                              ? 'bg-green-50 border-green-500 text-green-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500'
                          }`}
                          placeholder={letra === 'E' ? "Opcional" : `Alternativa ${letra}`}
                          // Sem @ts-ignore: Acesso seguro usando a variável tipada fieldName
                          value={formData[fieldName]}
                          onChange={e => setFormData({...formData, [fieldName]: e.target.value})}
                      />
                  </div>
                );
            })}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={uploading} className="px-8 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 shadow-lg flex items-center gap-2">
                <Save size={20} /> Salvar
            </button>
        </div>
      </form>
    </div>
  );
};