/**
 * SomaSikolo / KalanGest - Sidebar Navigation Component
 * Aesthetic: Deep Cobalt-Navy Glass & Wave Navigation Rail (Mobile Drawer & Desktop Sidebar)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  ClipboardList, 
  FileText, 
  CreditCard, 
  QrCode, 
  Settings, 
  CalendarCheck,
  UserPlus,
  X,
  ChevronRight,
  Wallet,
  CalendarDays,
  Bell,
  LogOut,
  ShieldCheck,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { AuthService } from '../../services/authService';

export type NavTab = 
  | 'dashboard'
  | 'inscription'
  | 'students'
  | 'classes'
  | 'subjects'
  | 'teachers'
  | 'grades'
  | 'attendance'
  | 'examSchedule'
  | 'bulletins'
  | 'cards'
  | 'payments'
  | 'cashier'
  | 'modules'
  | 'settings'
  | 'backup';

export interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLock?: () => void;
}

const getInitials = (fullName?: string): string => {
  if (!fullName) return 'AD';
  const cleaned = fullName
    .replace(/^(M\.|Mme|Mlle|Dr|Pr)\s+/i, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onLock
}) => {
  const { currentUser, canAccessTab, hasPermission } = useAuth();
  const { settings, payments, isFeatureEnabled } = useSchool();
  const [showAlertsPopover, setShowAlertsPopover] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setShowAlertsPopover(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const canViewPayments = hasPermission('payments:view') && isFeatureEnabled('payments');
  const pendingPayments = canViewPayments ? payments.filter(p => p.remainingAmount > 0) : [];

  const featureMap: Record<NavTab, keyof import('../../types').SchoolEnabledFeatures | null> = {
    dashboard: null,
    inscription: 'students',
    students: 'students',
    classes: 'classes',
    subjects: 'subjects',
    teachers: 'teachers',
    grades: 'grades',
    attendance: 'attendance',
    examSchedule: 'examSchedule',
    bulletins: 'bulletins',
    cards: 'cards',
    payments: 'payments',
    cashier: 'payments',
    modules: null,
    settings: null,
    backup: null
  };

  const navSections = [
    {
      title: 'Général',
      hideTitle: true,
      items: [
        { id: 'dashboard' as NavTab, label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'inscription' as NavTab, label: 'Inscription', icon: UserPlus },
      ]
    },
    {
      title: 'Scolarité',
      hideTitle: false,
      items: [
        { id: 'students' as NavTab, label: 'Élèves', icon: Users },
        { id: 'classes' as NavTab, label: 'Classes', icon: GraduationCap },
        { id: 'subjects' as NavTab, label: 'Matières', icon: BookOpen },
        { id: 'teachers' as NavTab, label: 'Enseignants', icon: Briefcase },
      ]
    },
    {
      title: 'Évaluations',
      hideTitle: false,
      items: [
        { id: 'grades' as NavTab, label: 'Notes', icon: ClipboardList },
        { id: 'attendance' as NavTab, label: 'Présences', icon: CalendarCheck },
        { id: 'examSchedule' as NavTab, label: 'Plannings Examens', icon: CalendarDays },
        { id: 'bulletins' as NavTab, label: 'Bulletins', icon: FileText },
        { id: 'cards' as NavTab, label: 'Cartes & Badges', icon: QrCode },
      ]
    },
    {
      title: 'Administration',
      hideTitle: false,
      items: [
        { id: 'payments' as NavTab, label: 'Paiements', icon: CreditCard },
        { id: 'cashier' as NavTab, label: 'Caisse', icon: Wallet },
        { id: 'settings' as NavTab, label: 'Paramètres', icon: Settings },
      ]
    }
  ].map(sec => ({
    ...sec,
    items: sec.items.filter(item => {
      if (!canAccessTab(item.id)) return false;
      const featKey = featureMap[item.id];
      if (!featKey) return true;
      return isFeatureEnabled(featKey);
    })
  })).filter(sec => sec.items.length > 0);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const userInitials = getInitials(currentUser?.fullName);
  const displayName = currentUser?.fullName || 'Administrateur';
  const roleLabel = AuthService.getRoleLabel(currentUser?.role || 'ADMIN');

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-[#010a24]/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR ASIDE ELEMENT */}
      <aside 
        className={`no-print relative overflow-hidden bg-gradient-to-b from-[#041d58] via-[#031645] to-[#020f31] text-white border-r border-blue-400/15 flex flex-col h-dvh select-none z-50 transition-all duration-200 ease-out
          /* Mobile Drawer Position */
          fixed lg:static top-0 bottom-0 left-0
          ${isMobileOpen ? 'translate-x-0 w-[290px] sm:w-[310px] max-w-[88vw]' : '-translate-x-full lg:translate-x-0'}
          /* Desktop Width (Expanded vs Collapsed) */
          ${isCollapsed ? 'lg:w-[78px]' : 'lg:w-[276px]'}
        `}
      >
        {/* Decorative Flowing Cobalt Wave Backdrop */}
        <svg
          aria-hidden="true"
          viewBox="0 0 320 220"
          fill="none"
          className="pointer-events-none absolute top-0 right-0 w-full h-44 opacity-90"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="kalangest-top-wave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M150 -10 C205 28, 250 18, 320 0 L320 96 C262 118, 178 134, 0 112 L0 105 C140 120, 222 86, 260 40 C282 14, 290 -5, 320 -10 Z"
            fill="url(#kalangest-top-wave)"
            opacity="0.32"
          />
          <path
            d="M205 -10 C235 42, 278 62, 320 50 L320 0 Z"
            fill="#0ea5e9"
            opacity="0.45"
          />
        </svg>

        <svg
          aria-hidden="true"
          viewBox="0 0 320 140"
          fill="none"
          className="pointer-events-none absolute bottom-0 left-0 w-full h-28 opacity-85"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="kalangest-bottom-wave" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <path
            d="M0 140 C95 135, 195 92, 320 68 L320 140 Z"
            fill="url(#kalangest-bottom-wave)"
          />
        </svg>

        {/* Brand Header */}
        <div className={`relative z-10 px-4 pt-4 pb-3 flex items-center shrink-0 ${isCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between gap-2'}`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Signature Cap + Open Book Emblem */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-sm" aria-hidden="true">
                {/* Graduation Cap */}
                <path d="M24 6 L44 15 L24 24 L4 15 Z" fill="#ffffff" />
                <path d="M13 19.5 L24 24.5 L35 19.5 L35 26 C35 28.5 30 31 24 31 C18 31 13 28.5 13 26 Z" fill="#38bdf8" />
                <path d="M41 16.5 L41 25" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="41" cy="26.5" r="2" fill="#38bdf8" />
                {/* Open Book */}
                <path d="M8 29 C14 27 19.5 29 24 33 C28.5 29 34 27 40 29 L40 41 C34 39 28.5 40.5 24 44 C19.5 40.5 14 39 8 41 Z" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M24 33 L24 44" stroke="#ffffff" strokeWidth="2.2" />
              </svg>
            </div>
            
            {/* Title & Subtitle */}
            <div className={`flex flex-col min-w-0 ${isCollapsed ? 'lg:hidden' : 'flex-1'}`}>
              <span className="font-extrabold text-[20px] tracking-tight leading-none truncate">
                <span className="text-white">Kalan</span>
                <span className="text-[#22a7ff]">Gest</span>
              </span>
              <span className="text-[12px] font-medium text-blue-100/80 truncate mt-1">
                Gestion Scolaire
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-blue-100/80 hover:text-white hover:bg-white/10 rounded-xl lg:hidden transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            title="Fermer le menu"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile & Notification Strip (Expanded Mode) */}
        {!isCollapsed ? (
          <div className="relative z-20 mx-3.5 mb-2 px-1 py-2.5 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {settings.logoUrl ? (
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/85 bg-white shrink-0 shadow-md">
                  <img
                    src={settings.logoUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] text-white font-bold text-sm flex items-center justify-center ring-2 ring-white/80 shadow-md shrink-0">
                  {userInitials}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[15px] font-bold text-white truncate leading-tight">
                    {displayName}
                  </span>
                  <BadgeCheck className="w-4 h-4 text-[#22a7ff] fill-[#22a7ff]/20 shrink-0" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1 text-[11.5px] font-medium text-blue-100/80 truncate mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-200/85 shrink-0" aria-hidden="true" />
                  <span className="truncate">{roleLabel}</span>
                </div>
              </div>
            </div>

            {/* Notification Bell with Real Alerts Popover */}
            <div className="relative shrink-0 pl-2.5 border-l border-white/15" ref={alertsRef}>
              <button
                type="button"
                onClick={() => setShowAlertsPopover(prev => !prev)}
                className="relative w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 flex items-center justify-center text-white transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {pendingPayments.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums flex items-center justify-center shadow-sm ring-2 ring-[#04194b]">
                    {pendingPayments.length > 99 ? '99+' : pendingPayments.length}
                  </span>
                )}
              </button>

              {showAlertsPopover && (
                <div className="absolute right-0 mt-2 w-64 bg-[#071f56] border border-sky-400/25 rounded-2xl shadow-2xl p-2.5 z-50 text-xs text-white">
                  <div className="pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-white">Notifications</span>
                    {canViewPayments && (
                      <span className="text-[11px] font-semibold text-rose-300 tabular-nums">
                        {pendingPayments.length} retard(s)
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar">
                    {canViewPayments && pendingPayments.length > 0 ? (
                      pendingPayments.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setShowAlertsPopover(false);
                            handleSelectTab('payments');
                          }}
                          className="w-full text-left p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-start gap-2 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white truncate">{p.studentName}</p>
                            <p className="text-[11px] text-blue-200/80 tabular-nums">
                              Reste : {p.remainingAmount.toLocaleString()} FCFA
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="py-2 text-center text-[11px] text-blue-200/75">
                        Aucune notification en attente.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Collapsed Desktop User Avatar */
          <div className="relative z-10 hidden lg:flex justify-center py-2.5 border-b border-white/10 mx-2 shrink-0">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] text-white font-bold text-xs flex items-center justify-center ring-2 ring-white/75 shadow-sm overflow-hidden"
              title={`${displayName} (${roleLabel})`}
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav 
          aria-label="Navigation principale"
          className={`relative z-10 flex-1 ${isCollapsed ? 'lg:overflow-visible' : 'overflow-y-auto'} overflow-y-auto px-3.5 py-2.5 space-y-4 custom-scrollbar`}
        >
          {navSections.map((sec, secIdx) => (
            <div key={sec.title || secIdx} className="space-y-1.5">
              {!isCollapsed && sec.title && !sec.hideTitle && (
                <div className="pt-1 pb-1">
                  <div className="text-[14px] font-bold text-white tracking-tight">
                    {sec.title}
                  </div>
                  <div className="w-8 h-1 rounded-full bg-[#0ea5e9] mt-1" />
                </div>
              )}
              {isCollapsed && secIdx > 0 && (
                <div className="my-2 border-t border-white/10 mx-2" />
              )}

              <div className="divide-y divide-white/[0.08]">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isDashboardActive = isActive && item.id === 'dashboard';
                  const isFrostActive = isActive && item.id !== 'dashboard';

                  return (
                    <div key={item.id} className="relative group py-1 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        title={isCollapsed ? `${item.label} (${sec.title})` : undefined}
                        className={`w-full min-h-[44px] flex items-center rounded-2xl text-[14px] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                          isCollapsed 
                            ? 'justify-center p-1' 
                            : 'gap-3 px-2 py-1.5'
                        } ${
                          isDashboardActive
                            ? isCollapsed
                              ? 'text-white'
                              : 'bg-gradient-to-r from-[#0ea5e9] via-[#1d78f0] to-[#1d4ed8] text-white font-bold shadow-[0_6px_18px_rgba(14,165,233,0.35)] ring-1 ring-sky-300/40'
                            : isFrostActive
                              ? isCollapsed
                                ? 'text-white'
                                : 'bg-[#e8f1ff] text-[#081d4a] font-bold shadow-md'
                              : 'text-white/95 hover:bg-white/[0.10] font-semibold'
                        }`}
                      >
                        <div 
                          className={`shrink-0 flex items-center justify-center transition-colors duration-150 ${
                            isCollapsed 
                              ? `w-10 h-10 rounded-xl ${
                                  isActive 
                                    ? 'bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] text-white shadow-md shadow-blue-500/40' 
                                    : 'bg-[#eef4ff] text-[#072056] group-hover:bg-white'
                                }`
                              : `w-9 h-9 rounded-xl ${
                                  isDashboardActive
                                    ? 'bg-white/20 text-white'
                                    : isFrostActive
                                      ? 'bg-white text-[#072056] shadow-2xs'
                                      : 'bg-[#eef4ff] text-[#072056] shadow-2xs'
                                }`
                          }`}
                        >
                          <Icon className="w-[18px] h-[18px]" strokeWidth={2.1} />
                        </div>

                        {/* Label (hidden in collapsed desktop mode) */}
                        <span className={`truncate whitespace-nowrap tracking-tight ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                          {item.label}
                        </span>

                        {/* Right Chevron */}
                        {!isCollapsed && (
                          <ChevronRight 
                            className={`ml-auto w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
                              isFrostActive ? 'text-[#081d4a]' : 'text-white/80'
                            }`} 
                          />
                        )}
                      </button>

                      {/* Floating Tooltip in Collapsed Desktop Mode */}
                      {isCollapsed && (
                        <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3 py-1.5 bg-[#061c4e] text-white text-xs font-medium rounded-xl shadow-xl whitespace-nowrap items-center gap-2 pointer-events-none border border-sky-400/25">
                          <span className="font-semibold text-white">{item.label}</span>
                          {sec.title && (
                            <>
                              <span aria-hidden="true" className="text-sky-300/60">·</span>
                              <span className="text-[11px] text-blue-200/80 font-normal">
                                {sec.title}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Logout Action */}
        <div className={`relative z-10 shrink-0 ${isCollapsed ? 'p-2.5 space-y-2' : 'px-3.5 pt-2 pb-3.5 space-y-2.5'}`}>
          {/* Déconnexion / Verrouillage */}
          {onLock && (
            <button
              type="button"
              onClick={() => {
                if (isMobileOpen) setIsMobileOpen(false);
                onLock();
              }}
              title="Déconnexion"
              aria-label="Déconnexion"
              className={`w-full rounded-2xl bg-[#051b4b]/75 hover:bg-rose-500/20 border border-white/20 hover:border-rose-300/45 text-white font-semibold text-[13.5px] flex items-center transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'
              }`}
            >
              <LogOut className="w-4.5 h-4.5 text-blue-100 shrink-0" />
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
