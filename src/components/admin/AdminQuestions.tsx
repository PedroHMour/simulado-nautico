import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit, Save, X, Search, CheckCircle } from "lucide-react";
import { QuestionDB } from "@/types"; // Assumindo que você tem esse tipo, ou use any por enquanto

export const AdminQuestions = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    category: "ARA", // Default Arrais
    text: "",
    answer_a: "",
    answer_b: "",
    answer_c: "",
    answer_d: "",
    correct_answer: "A"
  });

  // Carregar perguntas ao abrir
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setQuestions(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{
            ...formData,
            topic: 'GERAL', // Padrão por enquanto
            active: true
        }]);

      if (error) throw error;
      
      alert("Questão salva com sucesso!");
      setIsEditing(false);
      setFormData({ ...formData, text: "", answer_a: "", answer_b: "", answer_c: "", answer_d: "" }); // Limpa
      fetchQuestions(); // Recarrega lista
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir esta questão?")) return;
    await supabase.from('questions').delete().eq('id', id);
    fetchQuestions();
  };

  // --- TELA DE LISTAGEM ---
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} /> Nova Questão
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Carregando banco de dados...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Enunciado</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Resp. Correta</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium truncate max-w-md">{q.text}</td>
                    <td className="p-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${q.category === 'MTA' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                            {q.category}
                        </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-green-600">{q.correct_answer}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleDelete(q.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400">Nenhuma questão cadastrada ainda.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // --- TELA DE CADASTRO (FORMULÁRIO) ---
  return (
    <div className="max-w-3xl mx-auto p-6 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Nova Questão</h2>
        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    <option value="ARA">Arrais Amador (ARA)</option>
                    <option value="MTA">Motonauta (MTA)</option>
                    <option value="MSA">Mestre Amador (MSA)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Resposta Correta</label>
                <select 
                    className="w-full p-3 bg-green-50 border border-green-200 text-green-700 font-bold rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.correct_answer}
                    onChange={e => setFormData({...formData, correct_answer: e.target.value})}
                >
                    <option value="A">Alternativa A</option>
                    <option value="B">Alternativa B</option>
                    <option value="C">Alternativa C</option>
                    <option value="D">Alternativa D</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Enunciado da Pergunta</label>
            <textarea 
                required
                rows={3}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Qual é a luz de mastro de uma embarcação..."
                value={formData.text}
                onChange={e => setFormData({...formData, text: e.target.value})}
            />
        </div>

        <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Alternativas</label>
            {['A', 'B', 'C', 'D'].map((letra) => (
                <div key={letra} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${formData.correct_answer === letra ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {letra}
                    </div>
                    <input 
                        type="text"
                        required
                        className={`flex-1 p-3 border rounded-lg outline-none transition-all ${formData.correct_answer === letra ? 'border-green-500 ring-1 ring-green-500 bg-green-50' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`}
                        placeholder={`Texto da alternativa ${letra}`}
                        // @ts-ignore
                        value={formData[`answer_${letra.toLowerCase()}`]}
                        // @ts-ignore
                        onChange={e => setFormData({...formData, [`answer_${letra.toLowerCase()}`]: e.target.value})}
                    />
                    {formData.correct_answer === letra && <CheckCircle className="text-green-600 animate-in zoom-in" size={20} />}
                </div>
            ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button 
                type="submit" 
                className="px-8 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
                <Save size={20} /> Salvar Questão
            </button>
        </div>

      </form>
    </div>
  );
};