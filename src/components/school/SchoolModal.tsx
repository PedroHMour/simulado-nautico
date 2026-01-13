"use client";
import React, { useState } from "react";
import { X, School, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Usuario } from "@/types";

interface SchoolModalProps {
  usuario: Usuario;
  setOpen: (v: boolean) => void;
  onSucesso: () => void;
}

export const SchoolModal = ({ usuario, setOpen, onSucesso }: SchoolModalProps) => {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleVincular = async () => {
    if (!codigo) return;
    setLoading(true);
    setErro("");

    try {
      const { data: escola, error: errBusca } = await supabase
        .from('schools')
        .select('id, name')
        .eq('slug', codigo.toLowerCase().trim())
        .single();

      if (errBusca || !escola) {
        throw new Error("Código de escola inválido ou não encontrado.");
      }

      const { error: errUpdate } = await supabase
        .from('profiles')
        .update({ school_id: escola.id })
        .eq('id', usuario.id);

      if (errUpdate) throw errUpdate;

      onSucesso();
      setOpen(false);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao vincular escola.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="bg-blue-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold">
            <School /> Minha Escola
          </div>
          <button onClick={() => setOpen(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/30"><X size={20} /></button>
        </div>

        <div className="p-6">
          {usuario.school ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Você já é aluno!</h3>
              <p className="text-gray-500 mt-2">Vinculado a: <strong className="text-blue-900">{usuario.school.name}</strong></p>
              <button onClick={() => setOpen(false)} className="mt-6 w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Fechar</button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-4">
                Possui um código de acesso? Digite abaixo para liberar o conteúdo exclusivo da sua escola.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Código da Escola (Slug)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: vitor-nautica" 
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono text-center uppercase focus:border-blue-500 outline-none text-gray-800"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                </div>
                {erro && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={16} /> {erro}
                  </div>
                )}
                <button 
                  onClick={handleVincular} 
                  disabled={loading}
                  className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex justify-center disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Entrar na Turma"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};