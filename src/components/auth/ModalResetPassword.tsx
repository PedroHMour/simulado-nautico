import React, { useState } from "react";
import { X, Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const ModalResetPassword = ({ setOpen }: { setOpen: (v: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [msgErro, setMsgErro] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsgErro("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password", // Ajuste conforme sua rota
      });

      if (error) throw error;
      setSucesso(true);
    } catch (err: unknown) { // CORREÇÃO AQUI: Trocado 'any' por 'unknown'
      if (err instanceof Error) {
        setMsgErro(err.message);
      } else {
        setMsgErro("Erro ao enviar e-mail de recuperação.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 cursor-default relative animate-in zoom-in duration-200">
        <button 
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h2>
        <p className="text-gray-500 text-sm mb-6">Enviaremos um link para o seu e-mail.</p>

        {sucesso ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">E-mail Enviado!</h3>
            <p className="text-sm text-gray-500 mb-6">Verifique sua caixa de entrada (e spam).</p>
            <button onClick={() => setOpen(false)} className="text-blue-600 font-bold text-sm hover:underline">Fechar</button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {msgErro && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
                {msgErro}
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                required 
                type="email" 
                placeholder="seu@email.com" 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Enviar Link"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};