import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, CheckCircle } from 'lucide-react';

interface ModalResetProps {
  setOpen: (b: boolean) => void;
}

export function ModalResetPassword({ setOpen }: ModalResetProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSalvarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      setSucesso(true);
      setTimeout(() => setOpen(false), 2000); // Fecha em 2s
    } catch (err: any) {
      alert("Erro ao salvar senha: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Lock size={24} /> Criar Nova Senha
        </h2>
        
        {sucesso ? (
          <div className="text-center py-6">
             <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
             <p className="text-green-700 font-bold">Senha alterada com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSalvarSenha} className="space-y-4">
             <p className="text-gray-600 text-sm">Digite sua nova senha abaixo para finalizar a recuperação.</p>
             <input 
               type="password" 
               placeholder="Nova Senha"
               className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
               value={novaSenha}
               onChange={e => setNovaSenha(e.target.value)}
               minLength={6}
               required
             />
             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" /> : "Salvar Nova Senha"}
             </button>
          </form>
        )}
      </div>
    </div>
  );
}