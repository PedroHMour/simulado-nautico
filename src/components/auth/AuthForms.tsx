import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

interface AuthFormProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void; // Mantido para compatibilidade, mas vamos interceptar
  error: string;
  email: string;
  setEmail: (s: string) => void;
  senha: string;
  setSenha: (s: string) => void;
  nome: string;
  setNome: (s: string) => void;
  modo: 'login' | 'cadastro';
  alternarModo: () => void;
}

export function AuthForm({ 
  loading, error, email, setEmail, senha, setSenha, nome, setNome, modo, alternarModo 
}: AuthFormProps) {
  
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState("");
  const [loadingRecuperacao, setLoadingRecuperacao] = useState(false);

  // Função interna para login/cadastro
  const handleSubmitPrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    // Se for cadastro ou login normal
    if (modo === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password: senha,
        options: { data: { full_name: nome } }
      });
      if (error) alert(error.message);
      else alert("Cadastro realizado! Verifique seu e-mail.");
    }
  };

  // Função específica para enviar o e-mail de reset
  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRecuperacao(true);
    setMsgSucesso("");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redireciona para a home do site
      });
      
      if (error) throw error;
      setMsgSucesso("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (err: any) {
      alert(err.message || "Erro ao enviar e-mail.");
    } finally {
      setLoadingRecuperacao(false);
    }
  };

  // TELA DE RECUPERAÇÃO DE SENHA
  if (modoRecuperacao) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-300">
           <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-blue-900">Recuperar Acesso</h2>
              <p className="text-gray-500 text-sm mt-2">Digite seu e-mail para redefinir a senha.</p>
           </div>

           {msgSucesso ? (
             <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center mb-6 border border-green-200">
               {msgSucesso}
               <button onClick={() => setModoRecuperacao(false)} className="block w-full mt-4 text-sm font-bold underline">
                 Voltar para o Login
               </button>
             </div>
           ) : (
             <form onSubmit={handleRecuperarSenha} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    placeholder="Seu e-mail cadastrado" 
                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loadingRecuperacao}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingRecuperacao ? <Loader2 className="animate-spin" /> : "Enviar Link de Recuperação"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setModoRecuperacao(false)}
                  className="w-full text-gray-500 text-sm hover:text-gray-800 flex items-center justify-center gap-2 mt-4"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
             </form>
           )}
        </div>
      </div>
    );
  }

  // TELA NORMAL (LOGIN/CADASTRO)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            <AnchorIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Náutico Pro</h1>
          <p className="text-gray-500 text-sm mt-2">
            {modo === 'login' ? 'Bem-vindo de volta, comandante!' : 'Crie sua conta para começar.'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmitPrincipal} className="space-y-4">
          {modo === 'cadastro' && (
             <div className="relative">
               <User className="absolute left-3 top-3 text-gray-400" size={20} />
               <input 
                 type="text" placeholder="Seu Nome Completo" 
                 className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                 value={nome} onChange={e => setNome(e.target.value)} required 
               />
             </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="email" placeholder="Seu E-mail" 
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              value={email} onChange={e => setEmail(e.target.value)} required 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="password" placeholder="Sua Senha" 
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              value={senha} onChange={e => setSenha(e.target.value)} required 
            />
          </div>

          {modo === 'login' && (
            <div className="text-right">
              <button type="button" onClick={() => setModoRecuperacao(true)} className="text-xs text-blue-600 hover:underline">
                Esqueci minha senha
              </button>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (modo === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Grátis')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            {modo === 'login' ? 'Ainda não tem conta?' : 'Já tem cadastro?'}
            <button onClick={alternarModo} className="ml-2 text-blue-600 font-bold hover:underline">
              {modo === 'login' ? 'Cadastre-se' : 'Fazer Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Ícone auxiliar simples
function AnchorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
  );
}