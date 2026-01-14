import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit, Save, X, Search, CheckCircle, AlertTriangle } from "lucide-react";

export const AdminQuestions = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    category: "ARA", 
    text: "",
    answer_a: "",
    answer_b: "",
    answer_c: "",
    answer_d: "",
    correct_answer: "A"
  });

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
            topic: 'GERAL',
            active: true
        }]);

      if (error) throw error;
      
      alert("Questão salva com sucesso!");
      setIsEditing(false);
      setFormData({ ...formData, text: "", answer_a: "", answer_b: "", answer_c: "", answer_d: "" });
      fetchQuestions();
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
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Enunciado</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Gabarito</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium truncate max-w-md">{q.text}</td>
                    <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${q.category === 'MTA' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {q.category}
                        </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-green-600 pl-8">{q.correct_answer}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(q.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-12 text-center text-gray-400 flex flex-col items-center">
                            <AlertTriangle size={32} className="mb-2 opacity-50"/>
                            Nenhuma questão cadastrada ainda.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // --- TELA DE CADASTRO (FORMULÁRIO CORRIGIDO) ---
  return (
    <div className="max-w-3xl mx-auto p-6 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Cadastrar Nova Questão</h2>
        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all"><X size={24} /></button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoria da Prova</label>
                <select 
                    // CORRIGIDO: Fundo cinza claro, texto escuro
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    <option value="ARA">Arrais Amador (ARA)</option>
                    <option value="MTA">Motonauta (MTA)</option>
                    <option value="MSA">Mestre Amador (MSA)</option>
                    <option value="CPA">Capitão Amador (CPA)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Resposta Correta</label>
                <select 
                    // CORRIGIDO: Contraste alto para o select
                    className="w-full p-3 bg-green-50 border border-green-200 text-green-800 font-bold rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                // CORRIGIDO: Input de texto com fundo cinza e texto preto
                className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Digite aqui a pergunta completa..."
                value={formData.text}
                onChange={e => setFormData({...formData, text: e.target.value})}
            />
        </div>

        <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">Alternativas</label>
            {['A', 'B', 'C', 'D'].map((letra) => (
                <div key={letra} className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${formData.correct_answer === letra ? 'bg-green-600 text-white ring-2 ring-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        {letra}
                    </div>
                    <input 
                        type="text"
                        required
                        // CORRIGIDO: Inputs das alternativas
                        className={`flex-1 p-3 rounded-lg outline-none transition-all font-medium ${
                            formData.correct_answer === letra 
                            ? 'bg-green-50 border-green-500 text-green-900 placeholder-green-700/50' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white'
                        }`}
                        placeholder={`Digite a resposta da alternativa ${letra}`}
                        // @ts-ignore
                        value={formData[`answer_${letra.toLowerCase()}`]}
                        // @ts-ignore
                        onChange={e => setFormData({...formData, [`answer_${letra.toLowerCase()}`]: e.target.value})}
                    />
                    {formData.correct_answer === letra && <CheckCircle className="text-green-600 animate-in zoom-in" size={24} />}
                </div>
            ))}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button 
                type="submit" 
                className="px-8 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 transform active:scale-95"
            >
                <Save size={20} /> Salvar Questão
            </button>
        </div>

      </form>
    </div>
  );
};