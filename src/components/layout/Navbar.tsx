"use client";
import React from "react";
import { Anchor, Phone, CheckCircle, User, LogOut, Menu, School } from "lucide-react";
import { TelaTipo, Usuario } from "@/types";

interface NavbarProps {
  usuario: Usuario | null;
  telaAtual: TelaTipo;
  setTelaAtual: (tela: TelaTipo) => void;
  handleLogout: () => void;
  menuMobileAberto: boolean;
  setMenuMobileAberto: (v: boolean) => void;
  onOpenSchool: () => void;
}

export const Navbar = ({ 
  usuario, 
  telaAtual, 
  setTelaAtual, 
  handleLogout, 
  menuMobileAberto, 
  setMenuMobileAberto,
  onOpenSchool 
}: NavbarProps) => {

  // --- LÓGICA DE PERSONALIZAÇÃO ---
  // Se tiver escola, usa a cor dela. Se não, usa o Azul Padrão (#1e3a8a)
  const themeColor = usuario?.school?.primary_color || "#1e3a8a";
  const schoolName = usuario?.school?.name;
  const logoUrl = usuario?.school?.logo_url;

  return (
    <>
      {/* Barra de Topo (Suporte) - Fica com a cor da escola (mais escura) */}
      <div 
        className="text-white text-xs py-2 px-4 hidden md:flex justify-between items-center transition-colors duration-500"
        style={{ backgroundColor: themeColor, filter: 'brightness(0.8)' }} // Escurece um pouco a cor principal
      >
        <span className="font-bold opacity-90">{schoolName ? `Portal do Aluno - ${schoolName}` : "Central do Aluno Exclusiva"}</span>
        <div className="flex gap-4 opacity-80">
          <span className="flex items-center gap-1"><Phone size={12} /> Suporte</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} /> Online</span>
        </div>
      </div>

      <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* LOGO DINÂMICA */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTelaAtual("home")}>
              {/* Se tiver URL de logo, mostra a imagem. Se não, mostra ícone padrão colorido */}
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo Escola" className="h-12 w-auto object-contain" />
              ) : (
                <div 
                  className="p-2 rounded text-white transition-colors duration-500 shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  {usuario?.school ? <School size={24} /> : <Anchor size={24} />}
                </div>
              )}
              
              <div className="leading-tight">
                {schoolName ? (
                   // Nome da Escola Personalizada
                   <div>
                     <h1 className="text-xl font-bold uppercase" style={{ color: themeColor }}>
                       {schoolName.split(' ')[0]} {/* Pega só a primeira palavra pra destaque */}
                       <span className="text-gray-600 text-sm normal-case ml-1">
                         {schoolName.split(' ').slice(1).join(' ')}
                       </span>
                     </h1>
                     <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Parceiro Oficial</p>
                   </div>
                ) : (
                   // Padrão do Sistema
                   <div>
                     <h1 className="text-xl font-bold text-blue-900">NÁUTICA<span className="text-blue-500">PRO</span></h1>
                     <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Sistema de Ensino</p>
                   </div>
                )}
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => setTelaAtual("home")} className={`font-medium transition-colors ${telaAtual === 'home' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Simulados</button>
              <button onClick={() => setTelaAtual("exercicios")} className={`font-medium transition-colors ${telaAtual === 'exercicios' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Exercícios</button>
              <button onClick={() => setTelaAtual("estatisticas")} className={`font-medium transition-colors ${telaAtual === 'estatisticas' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Estatísticas</button>
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>

              {/* Botão da Escola (B2B) */}
              <button 
                onClick={onOpenSchool} 
                className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full transition-all border`}
                style={usuario?.school ? { 
                  color: themeColor, 
                  borderColor: themeColor,
                  backgroundColor: `${themeColor}15` // 15 é opacidade hex
                } : {
                  color: '#6b7280',
                  borderColor: 'transparent'
                }}
              >
                {usuario?.school ? (
                  <>
                    <School size={16} />
                    <span>{usuario.school.slug.toUpperCase()}</span>
                  </>
                ) : (
                  <>
                    <School size={16} />
                    <span>Vincular Escola</span>
                  </>
                )}
              </button>

              {/* Perfil Usuário */}
              <div className="flex items-center gap-3 cursor-pointer group relative">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{usuario?.user_metadata?.full_name?.split(' ')[0] || "Aluno"}</p>
                  <p className="text-xs font-bold" style={{ color: themeColor }}>Online</p>
                </div>
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  <User size={20} />
                </div>
                
                {/* Dropdown Sair */}
                <button onClick={handleLogout} className="absolute -bottom-10 right-0 w-24 bg-white text-red-600 text-sm font-medium py-2 px-4 shadow-lg rounded-lg border border-gray-100 hidden group-hover:flex items-center gap-2">
                  <LogOut size={14} /> Sair
                </button>
              </div>
            </nav>

            {/* Botão Mobile Toggle */}
            <button className="md:hidden text-gray-600 p-2" onClick={() => setMenuMobileAberto(!menuMobileAberto)}>
              <Menu size={28} />
            </button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {menuMobileAberto && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg absolute w-full z-50">
            <button onClick={() => { setTelaAtual("home"); setMenuMobileAberto(false); }} className="block w-full text-left font-bold text-gray-800">Simulados</button>
            <button onClick={() => { setTelaAtual("exercicios"); setMenuMobileAberto(false); }} className="block w-full text-left font-medium text-gray-600">Exercícios</button>
            <button onClick={() => { setTelaAtual("estatisticas"); setMenuMobileAberto(false); }} className="block w-full text-left font-medium text-gray-600">Estatísticas</button>
            
            <hr className="border-gray-100" />
            
            <button onClick={() => { onOpenSchool(); setMenuMobileAberto(false); }} className="flex items-center gap-2 w-full text-left font-bold" style={{ color: themeColor }}>
               <School size={18} /> {usuario?.school ? usuario.school.name : "Vincular Escola"}
            </button>
            
            <button onClick={handleLogout} className="w-full text-left text-red-600 font-bold flex items-center gap-2 mt-4">
               <LogOut size={18} /> Sair
            </button>
          </div>
        )}
      </header>
    </>
  );
};