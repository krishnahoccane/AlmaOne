import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Lock, RotateCw, ShieldCheck } from 'lucide-react';
import {
  Institution,
  PrivacySettings,
  UserProfile,
  WorkspaceId,
} from '../../types/alumni';
import { AlumniAvatar, DeterministicQrCode, InstitutionCrest } from '../ui/CommonUI';

interface DigitalIdViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  user: UserProfile;
  onUpdatePrivacy: (next: Partial<PrivacySettings>) => void;
}

export const DigitalIdView: React.FC<DigitalIdViewProps> = ({
  activeWorkspace,
  institutions,
  user,
  onUpdatePrivacy,
}) => {
  const [cardInstId, setCardInstId] = useState<string>(
    activeWorkspace === 'all' ? institutions[1]?.id ?? institutions[0]?.id ?? '' : activeWorkspace
  );
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (activeWorkspace !== 'all') {
      setCardInstId(activeWorkspace);
      setFlipped(false);
    }
  }, [activeWorkspace]);

  const selectedInst =
    institutions.find((i) => i.id === cardInstId) ?? institutions[0];

  if (!selectedInst) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Digital Alumni ID Card
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Official campus gate, library, and reunion entry pass synced to your unified AlmaOne identity
          </p>
        </div>

        {/* Institutional Card Selector */}
        <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 self-start sm:self-auto flex-wrap">
          {institutions.map((inst) => (
            <button
              key={inst.id}
              type="button"
              onClick={() => {
                setCardInstId(inst.id);
                setFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedInst.id === inst.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {inst.shortName}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive 3D Flip-able Card Column */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col items-center space-y-5">
          <div className="w-full max-w-[440px] perspective-1200">
            <div
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFlipped((f) => !f);
                }
              }}
              aria-label="Flip Digital Alumni ID Card"
              className={`relative w-full aspect-[1.58/1] min-h-[268px] cursor-pointer preserve-3d transition-transform duration-500 ${
                flipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div
                className="absolute inset-0 backface-hidden rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${selectedInst.theme.gradientFrom} 0%, ${selectedInst.theme.gradientTo} 100%)`,
                }}
              >
                {/* Top Institution Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                      <InstitutionCrest
                        variant={selectedInst.crestVariant}
                        color="#FFFFFF"
                        size={22}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold tracking-tight truncate">
                        {selectedInst.name}
                      </div>
                      <div className="text-[11px] text-white/75 truncate">
                        Official Verified Alumni Credential
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </div>
                </div>

                {/* Member Identity Block */}
                <div className="flex items-center gap-4 my-2">
                  <AlumniAvatar
                    name={user.name}
                    initials="RS"
                    avatarUrl={user.avatarUrl}
                    size="xl"
                    className="border-2 border-white/30"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-lg font-bold tracking-tight truncate">{user.name}</div>
                    <div className="text-xs text-white/90 truncate">
                      {selectedInst.userCredential.degree}
                    </div>
                    <div className="text-[11px] text-white/75 truncate">
                      {selectedInst.userCredential.department}
                    </div>
                    {user.privacy.showCompany && (
                      <div className="text-[11px] text-white/80 truncate pt-0.5">
                        {user.role} · {user.company}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Mono Credentials Strip */}
                <div className="pt-3 border-t border-white/20 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-white/65">Roll / Alumni No.</div>
                    <div className="font-mono text-xs font-semibold tracking-wide tabular-nums">
                      {selectedInst.userCredential.rollNumber}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-white/65">Class Of</div>
                    <div className="font-mono text-xs font-semibold tabular-nums">
                      {selectedInst.userCredential.batchYear}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/65">Campus Access</div>
                    <div className="font-mono text-xs font-semibold tabular-nums">
                      {selectedInst.userCredential.campusAccessCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK FACE */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6 bg-white border border-slate-300 shadow-lg flex flex-col justify-between text-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">
                      Campus Gate & Library Entry Pass
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Scan this dynamic code at {selectedInst.shortName} main gates, central library, or Alumni Guest House check-in.
                    </p>
                    <div className="pt-2 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-mono text-slate-800 truncate">
                          {user.privacy.showEmail ? user.email : 'Hidden by privacy'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-mono text-slate-800 tabular-nums">
                          {user.privacy.showPhone ? user.phone : 'Hidden by privacy'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Employer:</span>
                        <span className="text-slate-800 truncate">
                          {user.privacy.showCompany ? user.company : 'Hidden by privacy'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <DeterministicQrCode
                      value={`ALMAONE:${selectedInst.id}:${selectedInst.userCredential.rollNumber}:${user.id}`}
                      size={112}
                      fgColor={selectedInst.theme.primary}
                    />
                    <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                      {selectedInst.userCredential.campusAccessCode}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Verified via {selectedInst.userCredential.verificationMethod}</span>
                  <span className="font-mono tabular-nums">
                    Since {selectedInst.userCredential.verifiedSince}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              {flipped ? 'Show Front of ID Card' : 'Flip for Campus QR Pass'}
            </button>
          </div>
        </div>

        {/* Granular Privacy Controls Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                Granular Privacy Controls
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Changes update your Digital Alumni ID and cross-campus directory visibility immediately.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {(
              [
                {
                  key: 'showEmail',
                  title: 'Display Personal Email',
                  desc: 'Visible on your ID card back face and alumni profile drawer',
                },
                {
                  key: 'showPhone',
                  title: 'Display Phone Number',
                  desc: 'Allow verified classmates to view your mobile number directly',
                },
                {
                  key: 'showCompany',
                  title: 'Display Employer & Title',
                  desc: 'Show current organization on your Digital ID and directory card',
                },
                {
                  key: 'allowDirectMessages',
                  title: 'Accept Alumni Direct Messages',
                  desc: 'Let verified peers from shared campuses message you in-app',
                },
                {
                  key: 'searchableInDirectory',
                  title: 'Appear in Smart Directory Search',
                  desc: 'Include your profile in city cluster and batch directory filters',
                },
              ] as const
            ).map((setting) => {
              const enabled = user.privacy[setting.key];
              return (
                <div
                  key={setting.key}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      {enabled ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      {setting.title}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{setting.desc}</p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => onUpdatePrivacy({ [setting.key]: !enabled })}
                    className={`w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                      enabled ? 'bg-slate-900 justify-end' : 'bg-slate-200 justify-start'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-white shadow-xs block" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <span>
              Your unified AlmaOne identity encrypts institutional credentials separately—each school registrar only audits records belonging to their own campus.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
