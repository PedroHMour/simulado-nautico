import React, { useState } from "react";
import Image from "next/image";
import { Loader2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthFormProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  email: string;
  setEmail: (v: string) => void;
  senha: string;
  setSenha: (v: string) => void;
  nome: string;
  setNome: (v: string) => void;
  modo: "login" | "cadastro";
  alternarModo: () => void;
}

export const AuthForm = ({
  loading,
  onSubmit,
  error,
  email,
  setEmail,
  senha,
  setSenha,
  nome,
  setNome,
  modo,
  alternarModo,
}: AuthFormProps) => {
  // Estado local para controlar visibilidade da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Erro Google:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Cabeçalho */}
        <div className="bg-blue-900 p-8 text-center flex flex-col items-center">
            <div className="mb-4 bg-white p-2 rounded-xl shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="Logo NáuticaPro" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">NÁUTICA<span className="text-blue-400">PRO</span></h1>
            <p className="text-blue-200 text-sm">
              {modo === "login" ? "Bem-vindo de volta, comandante!" : "Inicie sua jornada náutica hoje."}
            </p>
        </div>

        <div className="p-8">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {modo === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-bold uppercase">Ou via e-mail</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {modo === "cadastro" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  // AQUI ESTÁ A MÁGICA: ALTERNA ENTRE PASSWORD E TEXT
                  type={mostrarSenha ? "text" : "password"}
                  required
                  // Aumentei o padding right (pr-12) para o texto não bater no olho
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="******"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                {/* BOTÃO DO OLHINHO */}
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition-colors p-1"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {modo === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Grátis'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={alternarModo}
              className="text-blue-600 font-bold hover:underline mt-1 text-sm"
            >
              {modo === "login" ? "Ainda não tem conta? Crie agora" : "Já tem conta? Fazer login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};