import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  GraduationCap,
  HeartHandshake,
  Home,
  Layers,
  Plus,
  ShieldCheck,
  Store,
  Users,
  X,
} from 'lucide-react';
import { Institution, InstitutionTheme, NavSection, WorkspaceId } from '../../types/alumni';
import { InstitutionCrest } from '../ui/CommonUI';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  activeWorkspace: WorkspaceId;
  activeInstitution: Institution | null;
  institutions: Institution[];
  theme: InstitutionTheme;
  pendingAdminCount: number;
  onOpenAddAlmaMater: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const MEMBER_NAV: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'feed', label: 'Home Feed', icon: Home },
  { id: 'directory', label: 'Alumni Directory', icon: Users },
  { id: 'groups', label: 'Chapters & Groups', icon: Layers },
  { id: 'jobs', label: 'Jobs & Referrals', icon: Briefcase },
  { id: 'mentorship', label: 'Mentorship Hub', icon: GraduationCap },
  { id: 'events', label: 'Events & Reunions', icon: Calendar },
  { id: 'businesses', label: 'Business Directory', icon: Store },
  { id: 'giving', label: 'Giving & Campaigns', icon: HeartHandshake },
  { id: 'id-card', label: 'Digital Alumni ID', icon: CreditCard },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  activeWorkspace,
  activeInstitution,
  institutions,
  theme,
  pendingAdminCount,
  onOpenAddAlmaMater,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleNav = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Wordmark */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
        <button
          type="button"
          onClick={() => handleNav('feed')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-md"
        >
          <InstitutionCrest
            variant={activeInstitution ? activeInstitution.crestVariant : 'unified'}
            color={theme.primary}
            size={26}
          />
          <span className="font-bold text-[15px] tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            AlmaOne
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Close navigation menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Workspace Context Summary */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="truncate font-medium text-slate-800">
            {activeWorkspace === 'all'
              ? `All Alma Maters (${institutions.length})`
              : activeInstitution?.shortName}
          </span>
          <span className="font-mono text-[11px] tabular-nums shrink-0 text-slate-400">
            {activeWorkspace === 'all'
              ? 'Unified'
              : `’${String(activeInstitution?.userCredential.batchYear).slice(-2)}`}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
          {activeWorkspace === 'all'
            ? '1 Verified Identity · Multi-Campus'
            : activeInstitution?.userCredential.degree}
        </p>
      </div>

      {/* Primary Member Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Primary Navigation">
        {MEMBER_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors whitespace-nowrap text-left ${
                isActive
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: theme.softBg,
                      color: theme.primary,
                    }
                  : undefined
              }
            >
              <Icon
                className="w-4 h-4 shrink-0"
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Divider + Toggleable Admin Portal */}
        <div className="pt-3 mt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleNav('admin')}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors whitespace-nowrap ${
              activeSection === 'admin'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Admin Portal</span>
            </span>
            {pendingAdminCount > 0 && (
              <span
                className={`text-[11px] font-mono tabular-nums shrink-0 ${
                  activeSection === 'admin' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {pendingAdminCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Verified Institutions Quick Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Verified Campuses
          </span>
          <span className="font-mono text-[11px] tabular-nums text-slate-500">
            {institutions.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onOpenAddAlmaMater();
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Alma Mater
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:block w-[252px] shrink-0 h-screen sticky top-0 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-slate-950/40 backdrop-blur-[1px]"
          onClick={onCloseMobile}
        >
          <aside
            className="w-[268px] max-w-[82vw] h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
