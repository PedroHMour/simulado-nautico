"use client";
import React from "react";
import { Users, FileText, School, ArrowLeft } from "lucide-react";

interface AdminDashboardProps {
  voltar: () => void;
}

export const AdminDashboard = ({ voltar }: AdminDashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={voltar} className="bg-white p-2 rounded-full shadow hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
            <p className="text-gray-500">Gestão geral do sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Escolas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <School size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Gerenciar Escolas</h3>
            <p className="text-sm text-gray-500 mt-1">Cadastrar parceiros, cores e logos.</p>
          </div>

          {/* Card Perguntas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Banco de Questões</h3>
            <p className="text-sm text-gray-500 mt-1">Adicionar, editar ou remover perguntas.</p>
          </div>

          {/* Card Usuários */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Usuários</h3>
            <p className="text-sm text-gray-500 mt-1">Ver alunos cadastrados e admins.</p>
          </div>
        </div>
      </div>
    </div>
  );
};