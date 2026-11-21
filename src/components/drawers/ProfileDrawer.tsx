import React from 'react';
import {
  Briefcase,
  Check,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  UserPlus,
  X,
} from 'lucide-react';
import { Alumnus, Institution, InstitutionTheme } from '../../types/alumni';
import { AlumniAvatar, InstitutionCrest } from '../ui/CommonUI';

interface ProfileDrawerProps {
  alumnus: Alumnus | null;
  institutions: Institution[];
  theme: InstitutionTheme;
  onClose: () => void;
  onToggleConnect: (alumnusId: string) => void;
  onSendMessage: (alumnus: Alumnus) => void;
  onRequestMentorship: (alumnus: Alumnus) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  alumnus,
  institutions,
  theme,
  onClose,
  onToggleConnect,
  onSendMessage,
  onRequestMentorship,
}) => {
  if (!alumnus) return null;

  const userInstIds = new Set(institutions.map((i) => i.id));
  const sharedInstitutions = alumnus.credentials.filter((c) => userInstIds.has(c.institutionId));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-[1px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${alumnus.name} profile`}
    >
      <div
        className="w-full max-w-md bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-slate-500">Unified Alumni Profile</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close profile drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Profile Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity Header */}
          <div className="flex items-start gap-4">
            <AlumniAvatar
              name={alumnus.name}
              initials={alumnus.initials}
              tone={alumnus.avatarTone}
              size="xl"
            />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{alumnus.name}</h2>
              <p className="text-sm text-slate-700 mt-0.5">
                {alumnus.role} at <span className="font-semibold">{alumnus.company}</span>
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {alumnus.city}, {alumnus.country} · {alumnus.industry}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onToggleConnect(alumnus.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              style={
                alumnus.connected || alumnus.connectionPending
                  ? {
                      backgroundColor: '#F1F5F9',
                      color: '#0F172A',
                    }
                  : {
                      backgroundColor: theme.primary,
                      color: '#FFFFFF',
                    }
              }
            >
              {alumnus.connected ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Connected
                </>
              ) : alumnus.connectionPending ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Requested
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Connect
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onSendMessage(alumnus)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </button>
            <button
              type="button"
              onClick={() => onRequestMentorship(alumnus)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 whitespace-nowrap"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Mentorship
            </button>
          </div>

          {/* Bio & Open To */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed">{alumnus.bio}</p>
            {alumnus.openTo.length > 0 && (
              <div className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">Open to: </span>
                {alumnus.openTo.join(' · ')}
              </div>
            )}
          </div>

          {/* Shared Institutions & Academic Credentials */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900">
                Verified Academic Credentials
              </h3>
              {sharedInstitutions.length > 0 && (
                <span className="text-xs font-medium text-emerald-700">
                  {sharedInstitutions.length} Shared Alma Mater
                  {sharedInstitutions.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {alumnus.credentials.map((cred) => {
                const inst = institutions.find((i) => i.id === cred.institutionId);
                const isShared = userInstIds.has(cred.institutionId);
                return (
                  <div
                    key={`${cred.institutionId}-${cred.batchYear}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                  >
                    <InstitutionCrest
                      variant={inst?.crestVariant ?? 'columns'}
                      color={inst?.theme.primary ?? '#334155'}
                      size={22}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {inst?.name ?? cred.institutionId}
                        </span>
                        {isShared && (
                          <span className="text-[11px] font-medium text-slate-600 shrink-0">
                            Shared Campus
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {cred.degree} · {cred.department}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                        Class of {cred.batchYear}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Timeline */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900">Career Timeline</h3>
            <div className="space-y-3">
              {alumnus.careerTimeline.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{entry.role}</div>
                    <div className="text-xs text-slate-600">
                      {entry.company} · {entry.location}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                      {entry.period}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy-Filtered Contact Details */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900">Contact & Privacy</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </span>
                {alumnus.showEmail ? (
                  <span className="font-mono text-slate-800">{alumnus.email}</span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Lock className="w-3 h-3" /> Hidden by member
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
                <span className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  Phone
                </span>
                {alumnus.showPhone ? (
                  <span className="font-mono text-slate-800 tabular-nums">{alumnus.phone}</span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Lock className="w-3 h-3" /> Private — use Direct Message
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
