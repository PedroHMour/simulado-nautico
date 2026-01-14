import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail } from "lucide-react";
import { Usuario } from "@/types";

interface AdminStudentsProps {
    usuario: Usuario;
}

export const AdminStudents = ({ usuario }: AdminStudentsProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    if (!usuario.school_id) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', usuario.school_id)
      .order('created_at', { ascending: false });
    
    if (data) setStudents(data);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-blue-900">Meus Alunos</h1>
            <p className="text-gray-500">Gerencie o acesso dos alunos da sua escola.</p>
        </div>

        {loading ? (
             <p className="text-center text-gray-500 py-10">Carregando lista de alunos...</p>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nome</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">E-mail</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Cadastro</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((aluno) => (
                            <tr key={aluno.id} className="hover:bg-blue-50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <span className="font-bold text-gray-800">{aluno.full_name || "Sem nome"}</span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} /> {aluno.email}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(aluno.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-4 text-right">
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Ativo</span>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">
                                    Nenhum aluno vinculado a esta escola ainda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};