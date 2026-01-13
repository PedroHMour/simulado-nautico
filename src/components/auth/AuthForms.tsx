import React from "react";
import { Anchor, Loader2, User, Mail, Lock } from "lucide-react";

interface AuthProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  email: string;
  setEmail: (v: string) => void;
  senha: string;
  setSenha: (v: string) => void;
  nome?: string;
  setNome?: (v: string) => void;
  alternarModo: () => void;
  modo: "login" | "cadastro";
}

export const AuthForm = ({ loading, onSubmit, error, email, setEmail, senha, setSenha, nome, setNome, alternarModo, modo }: AuthProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-900 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Anchor size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-blue-900">NÁUTICA<span className="text-blue-500">PRO</span></h1>
          <p className="text-gray-500 text-sm mt-2">
            {modo === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta para começar'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {modo === 'cadastro' && setNome && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Nome Completo" 
                className="w-full pl-10 p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-900 outline-none" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="E-mail" 
              className="w-full pl-10 p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-900 outline-none" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="Senha" 
              className="w-full pl-10 p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-900 outline-none" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
            />
          </div>

          {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">{error}</div>}
          
          <button disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-70 flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (modo === 'login' ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-gray-50">
          <button onClick={alternarModo} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
};