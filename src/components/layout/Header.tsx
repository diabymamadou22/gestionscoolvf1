/**
 * SomaSikolo / KalanGest - Header Bar Component
 * En-tête ultra-simple, épuré et sans surcharge :
 * - Côté gauche : Bouton Menu + Nom de l'établissement
 * - Centre : Barre de recherche simple
 * - Côté droit : Notifications, Verrouillage et Avatar profil avec menu contextuel
 */

import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  X
} from 'lucide-react';
import { useSchool } from '../../contexts/SchoolContext';

interface HeaderProps {
  onSearchQuery?: (q: string) => void;
  onLock?: () => void;
  onOpenQrScanner?: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearchQuery, 
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onOpenMobileMenu
}) => {
  const { settings } = useSchool();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (onSearchQuery) onSearchQuery(e.target.value);
  };

  return (
    <header className="no-print h-10 sm:h-11 bg-white border-b border-slate-200/90 px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-20">
      
      {/* 1. GAUCHE : Menu + Nom Établissement (Compact & Net) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {/* Toggle Mobile */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Ouvrir le menu"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Toggle Desktop Sidebar (Icone seule, ultra-propre) */}
        <button
          type="button"
          onClick={onToggleSidebarCollapse}
          className="hidden lg:flex p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title={isSidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          aria-label={isSidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Nom Établissement & Année */}
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
            {settings.schoolName || 'KalanGest'}
          </span>
          {settings.currentAcademicYear && (
            <span className="hidden md:inline text-[10px] font-semibold text-slate-400 font-mono">
              ({settings.currentAcademicYear})
            </span>
          )}
        </div>
      </div>

      {/* 2. CENTRE : Recherche Simple Ultra-Compacte */}
      <div className="hidden md:flex items-center relative w-56 lg:w-72 mx-2">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Rechercher élève, classe..."
          className="w-full pl-8 pr-7 py-1 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-slate-400 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors h-7"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              if (onSearchQuery) onSearchQuery('');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3. DROITE : Loupe recherche sur Mobile uniquement */}
      <div className="flex items-center md:hidden">
        <button
          type="button"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Rechercher"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Barre de recherche sur Mobile */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 px-3 py-1.5 shadow-md z-30 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={handleSearchChange}
              placeholder="Rechercher élève, classe..."
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none h-7"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setShowMobileSearch(false);
              setSearch('');
              if (onSearchQuery) onSearchQuery('');
            }}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </header>
  );
};
