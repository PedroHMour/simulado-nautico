"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Phone, CheckCircle, User, LogOut, School, ChevronDown, Loader2, BookOpen } from "lucide-react";
import { TelaTipo, Usuario } from "@/types";

interface NavbarProps {
  usuario: Usuario | null;
  telaAtual: TelaTipo;
  setTelaAtual: (tela: TelaTipo) => void;
  handleLogout: () => void;
  onOpenSchool: () => void;
  // Removi as props de menu mobile pois não são mais necessárias
}

export const Navbar = ({ 
  usuario, 
  telaAtual, 
  setTelaAtual, 
  handleLogout, 
  onOpenSchool 
}: NavbarProps) => {

  const themeColor = usuario?.school?.primary_color || "#1e3a8a";
  const schoolName = usuario?.school?.name;
  const logoUrl = usuario?.school?.logo_url;

  // Estado para controlar o menu do perfil (Dropdown Desktop)
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [saindo, setSaindo] = useState(false);

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogoutClick = async () => {
      setSaindo(true);
      await handleLogout();
      setSaindo(false); 
  };

  return (
    <>
      {/* BARRA DE TOPO (ESCURA - DESKTOP ONLY) */}
      <div 
        className="text-white text-xs py-2 px-4 hidden md:flex justify-between items-center transition-colors duration-500"
        style={{ backgroundColor: themeColor, filter: 'brightness(0.8)' }} 
      >
        <span className="font-bold opacity-90 tracking-wide">
            {schoolName ? `PORTAL DO ALUNO - ${schoolName.toUpperCase()}` : "CENTRAL DO ALUNO"}
        </span>
        <div className="flex gap-4 opacity-80 font-medium">
          <span className="flex items-center gap-1 cursor-help hover:text-white transition-colors"><Phone size={12} /> Suporte Técnico</span>
          <span className="flex items-center gap-1 text-green-300"><CheckCircle size={12} /> Sistema Online</span>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center md:justify-between items-center h-16 md:h-20 relative">
            
            {/* LOGO E TÍTULO (Centralizado no Mobile, Esquerda no Desktop) */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setTelaAtual("home")}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo Escola" className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
              ) : (
                <div className="relative h-8 w-8 md:h-12 md:w-12">
                   <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                </div>
              )}
              
              <div className="leading-none text-center md:text-left">
                {schoolName ? (
                   <div className="flex flex-col">
                     <h1 className="text-sm md:text-xl font-bold uppercase tracking-tight" style={{ color: themeColor }}>
                       {schoolName}
                     </h1>
                     <p className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Ambiente Virtual</p>
                   </div>
                ) : (
                   <div className="flex flex-col">
                     <h1 className="text-lg md:text-xl font-bold text-blue-900 tracking-tight">NÁUTICA<span className="text-blue-500">PRO</span></h1>
                     <p className="text-[9px] md:text-[10px] text-gray-500 font-medium tracking-widest uppercase">Ensino à Distância</p>
                   </div>
                )}
              </div>
            </div>

            {/* NAVEGAÇÃO DESKTOP (Invisível no Mobile) */}
            <nav className="hidden md:flex items-center gap-6">
              <div className="flex items-center bg-gray-50 rounded-full px-1 p-1 border border-gray-100">
                  <button onClick={() => setTelaAtual("home")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${telaAtual === 'home' ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Simulados</button>
                  <button onClick={() => setTelaAtual("exercicios")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${telaAtual === 'exercicios' ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Exercícios</button>
                  <button onClick={() => setTelaAtual("apostilas")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${telaAtual === 'apostilas' ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Apostilas</button>
                  <button onClick={() => setTelaAtual("estatisticas")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${telaAtual === 'estatisticas' ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Desempenho</button>
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              {/* Botão Vincular Escola */}
              <button 
                onClick={onOpenSchool} 
                className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-all border hover:opacity-80`}
                style={usuario?.school ? { 
                  color: themeColor, 
                  borderColor: `${themeColor}30`,
                  backgroundColor: `${themeColor}05` 
                } : {
                  color: '#6b7280',
                  borderColor: '#e5e7eb',
                  backgroundColor: '#f9fafb'
                }}
              >
                <School size={16} />
                <span>{usuario?.school ? usuario.school.slug.toUpperCase() : "VINCULAR ESCOLA"}</span>
              </button>

              {/* MENU PERFIL (DROPDOWN) */}
              <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                >
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{usuario?.user_metadata?.full_name?.split(' ')[0] || "Aluno"}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide opacity-70" style={{ color: themeColor }}>Conectado</p>
                    </div>
                    <div 
                        className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                        style={{ backgroundColor: themeColor }}
                    >
                        {usuario?.user_metadata?.full_name?.charAt(0).toUpperCase() || <User size={18} />}
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* O DROPDOWN EM SI */}
                {profileOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                        <div className="px-4 py-3 border-b border-gray-50 lg:hidden">
                            <p className="text-sm font-bold text-gray-900">{usuario?.user_metadata?.full_name}</p>
                            <p className="text-xs text-gray-500">{usuario?.email}</p>
                        </div>
                        
                        <button onClick={() => { setTelaAtual('perfil'); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium transition-colors">
                            <User size={16} className="text-gray-400" /> Meu Perfil
                        </button>
                        
                        <div className="my-1 border-t border-gray-100"></div>
                        
                        <button 
                            onClick={onLogoutClick} 
                            disabled={saindo}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors"
                        >
                            {saindo ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} 
                            {saindo ? "Saindo..." : "Sair da Conta"}
                        </button>
                    </div>
                )}
              </div>
            </nav>
            {/* Menu Hambúrguer REMOVIDO DAQUI */}
          </div>
        </div>
      </header>
    </>
  );
};