import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  Globe,
  Lock,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Shield,
  X,
} from 'lucide-react';
import {
  AlumniBusiness,
  AlumniEvent,
  Alumnus,
  AppNotification,
  Institution,
  InstitutionTheme,
  JobListing,
  NavSection,
  PrivacySettings,
  UserProfile,
  WorkspaceId,
} from '../../types/alumni';
import { AlumniAvatar, InstitutionCrest } from '../ui/CommonUI';

interface TopHeaderProps {
  institutions: Institution[];
  activeWorkspace: WorkspaceId;
  activeInstitution: Institution | null;
  theme: InstitutionTheme;
  user: UserProfile;
  alumni: Alumnus[];
  jobs: JobListing[];
  events: AlumniEvent[];
  businesses: AlumniBusiness[];
  notifications: AppNotification[];
  unreadMessagesCount: number;
  onSelectWorkspace: (workspaceId: WorkspaceId) => void;
  onOpenAddAlmaMater: () => void;
  onOpenMessages: () => void;
  onMarkNotificationsRead: () => void;
  onNavigateSection: (section: NavSection) => void;
  onOpenAlumnusProfile: (alumnus: Alumnus) => void;
  onUpdatePrivacy: (next: Partial<PrivacySettings>) => void;
  onOpenMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  institutions,
  activeWorkspace,
  activeInstitution,
  theme,
  user,
  alumni,
  jobs,
  events,
  businesses,
  notifications,
  unreadMessagesCount,
  onSelectWorkspace,
  onOpenAddAlmaMater,
  onOpenMessages,
  onMarkNotificationsRead,
  onNavigateSection,
  onOpenAlumnusProfile,
  onUpdatePrivacy,
  onOpenMobileMenu,
}) => {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const switcherRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (switcherRef.current && !switcherRef.current.contains(target)) setSwitcherOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedAlumni = alumni
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const matchedJobs = jobs
      .filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedEvents = events
      .filter((ev) => ev.title.toLowerCase().includes(q) || ev.location.toLowerCase().includes(q))
      .slice(0, 2);

    const matchedBusinesses = businesses
      .filter((b) => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
      .slice(0, 2);

    return {
      alumni: matchedAlumni,
      jobs: matchedJobs,
      events: matchedEvents,
      businesses: matchedBusinesses,
      total:
        matchedAlumni.length + matchedJobs.length + matchedEvents.length + matchedBusinesses.length,
    };
  }, [searchQuery, alumni, jobs, events, businesses]);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left Zone: Mobile Menu + Institution Workspace Switcher */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative" ref={switcherRef}>
          <button
            type="button"
            onClick={() => {
              setSwitcherOpen((v) => !v);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors text-left max-w-[260px] sm:max-w-[300px]"
            aria-expanded={switcherOpen}
            aria-haspopup="listbox"
          >
            {activeWorkspace === 'all' ? (
              <Globe className="w-4 h-4 shrink-0 text-slate-700" />
            ) : (
              <InstitutionCrest
                variant={activeInstitution?.crestVariant ?? 'columns'}
                color={theme.primary}
                size={18}
                className="shrink-0"
              />
            )}
            <span className="text-[13px] font-semibold text-slate-900 truncate">
              {activeWorkspace === 'all'
                ? 'All Alma Maters (Unified)'
                : activeInstitution?.name}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                switcherOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {switcherOpen && (
            <div
              className="absolute left-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50"
              role="listbox"
            >
              <div className="px-3.5 py-1.5 text-[11px] font-medium text-slate-500">
                Switch Institution Workspace
              </div>

              {/* Unified View Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectWorkspace('all');
                  setSwitcherOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left transition-colors ${
                  activeWorkspace === 'all' ? 'bg-slate-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">
                      All Alma Maters (Unified View)
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Combined feed, directory & events across {institutions.length} campuses
                    </div>
                  </div>
                </div>
                {activeWorkspace === 'all' && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
              </button>

              <div className="my-1.5 border-t border-slate-100" />
              <div className="px-3.5 py-1 text-[11px] font-medium text-slate-500">
                Verified Institutions ({institutions.length})
              </div>

              {institutions.map((inst) => {
                const selected = activeWorkspace === inst.id;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => {
                      onSelectWorkspace(inst.id);
                      setSwitcherOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left transition-colors ${
                      selected ? 'bg-slate-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: inst.theme.softBg,
                          borderColor: inst.theme.softBorder,
                        }}
                      >
                        <InstitutionCrest
                          variant={inst.crestVariant}
                          color={inst.theme.primary}
                          size={16}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-slate-900 truncate">
                          {inst.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {inst.userCredential.degree} · Class of {inst.userCredential.batchYear}
                        </div>
                      </div>
                    </div>
                    {selected && (
                      <Check className="w-4 h-4 shrink-0" style={{ color: inst.theme.primary }} />
                    )}
                  </button>
                );
              })}

              <div className="mt-1.5 pt-1.5 border-t border-slate-100 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setSwitcherOpen(false);
                    onOpenAddAlmaMater();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-500" />
                  Add Another School / College
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Zone: Global Search */}
      <div className="hidden md:block flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search alumni, companies, jobs, events..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {searchFocused && searchResults && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
            {searchResults.total === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500">
                No matches found for “{searchQuery}”.
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                {searchResults.alumni.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      Alumni
                    </div>
                    {searchResults.alumni.map((alum) => (
                      <button
                        key={alum.id}
                        type="button"
                        onClick={() => {
                          onOpenAlumnusProfile(alum);
                          setSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left"
                      >
                        <AlumniAvatar
                          name={alum.name}
                          initials={alum.initials}
                          tone={alum.avatarTone}
                          size="xs"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {alum.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {alum.role} at {alum.company} · {alum.city}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      Jobs & Referrals
                    </div>
                    {searchResults.jobs.map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => {
                          onNavigateSection('jobs');
                          setSearchFocused(false);
                        }}
                        className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left"
                      >
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {job.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {job.company} · {job.location}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.events.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      Events & Reunions
                    </div>
                    {searchResults.events.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          onNavigateSection('events');
                          setSearchFocused(false);
                        }}
                        className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left"
                      >
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {ev.dateDisplay} · {ev.location}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.businesses.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      Alumni Businesses
                    </div>
                    {searchResults.businesses.map((biz) => (
                      <button
                        key={biz.id}
                        type="button"
                        onClick={() => {
                          onNavigateSection('businesses');
                          setSearchFocused(false);
                        }}
                        className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left"
                      >
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {biz.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {biz.category} · Code: {biz.discountCode}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Zone: Notifications, Direct Messages, Profile Menu */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setSwitcherOpen(false);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadNotifCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-[10px] font-mono font-semibold text-white flex items-center justify-center tabular-nums"
                style={{ backgroundColor: theme.primary }}
              >
                {unreadNotifCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                {unreadNotifCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkNotificationsRead}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (n.institutionId) onSelectWorkspace(n.institutionId);
                      onNavigateSection(n.targetSection);
                      setNotifOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                      !n.read ? 'bg-slate-50/70' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 leading-snug">
                        {n.title}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Direct Messages Trigger */}
        <button
          type="button"
          onClick={onOpenMessages}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Direct messages"
        >
          <MessageSquare className="w-[18px] h-[18px]" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-slate-900 text-[10px] font-mono font-semibold text-white flex items-center justify-center tabular-nums">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* User Profile & Privacy Menu */}
        <div className="relative pl-1" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setSwitcherOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="User profile and privacy controls"
          >
            <AlumniAvatar
              name={user.name}
              initials="RS"
              avatarUrl={user.avatarUrl}
              size="sm"
            />
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-500 whitespace-nowrap">
                {institutions.length} Verified Campuses
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-[310px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <AlumniAvatar
                    name={user.name}
                    initials="RS"
                    avatarUrl={user.avatarUrl}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {user.role} · {user.company}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  {institutions.map((inst) => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between text-[11px] text-slate-600"
                    >
                      <span className="truncate font-medium">{inst.shortName}</span>
                      <span className="font-mono text-slate-400 shrink-0 tabular-nums">
                        Class of {inst.userCredential.batchYear}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Privacy Controls */}
              <div className="p-4 border-b border-slate-100 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Privacy Controls
                </div>

                {(
                  [
                    { key: 'showEmail', label: 'Show email in directory' },
                    { key: 'showPhone', label: 'Show phone number' },
                    { key: 'showCompany', label: 'Show current employer' },
                    { key: 'allowDirectMessages', label: 'Allow alumni DMs' },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-2 text-xs text-slate-700 cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={user.privacy[item.key]}
                      onClick={() => onUpdatePrivacy({ [item.key]: !user.privacy[item.key] })}
                      className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center ${
                        user.privacy[item.key] ? 'bg-slate-900 justify-end' : 'bg-slate-200 justify-start'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs block" />
                    </button>
                  </label>
                ))}
              </div>

              <div className="p-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateSection('id-card');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  Open Digital Alumni ID Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateSection('admin');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  Switch to Institutional Admin Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
