import React, { useState } from 'react';
import { CheckCircle2, Mail, Hash, Users, ArrowRight } from 'lucide-react';
import { Institution } from '../../types/alumni';
import { UNIFIED_BANNER_URL } from '../../data/mockData';
import { ModalShell } from '../ui/CommonUI';

interface AddAlmaMaterModalProps {
  open: boolean;
  onClose: () => void;
  onAddInstitution: (inst: Institution) => void;
}

const PRESET_CAMPUSES = [
  { name: 'IIT Bombay', type: 'Engineering Institute' as const, location: 'Mumbai, Maharashtra', domain: 'iitb.ac.in', motto: 'Knowledge is the Supreme Goal' },
  { name: 'Delhi Public School, R.K. Puram', type: 'High School' as const, location: 'New Delhi', domain: 'dpsrkp.net', motto: 'Service Before Self' },
  { name: 'Stanford University', type: 'University' as const, location: 'Stanford, CA', domain: 'stanford.edu', motto: 'Die Luft der Freiheit weht' },
  { name: 'IIM Ahmedabad', type: 'Business School' as const, location: 'Ahmedabad, Gujarat', domain: 'iima.ac.in', motto: 'Vidya Viniyogadvikasaha' },
];

const THEME_PRESETS = [
  {
    id: 'burgundy',
    label: 'Crimson & Slate',
    theme: {
      primary: '#991B1B',
      primaryHover: '#7F1D1D',
      secondary: '#475569',
      softBg: '#FEF2F2',
      softBorder: '#FECACA',
      textAccent: '#991B1B',
      gradientFrom: '#7F1D1D',
      gradientTo: '#1E293B',
    },
  },
  {
    id: 'teal',
    label: 'Deep Teal & Sand',
    theme: {
      primary: '#0F766E',
      primaryHover: '#115E59',
      secondary: '#B45309',
      softBg: '#F0FDFA',
      softBorder: '#99F6E4',
      textAccent: '#0F766E',
      gradientFrom: '#134E4A',
      gradientTo: '#0F172A',
    },
  },
  {
    id: 'navy',
    label: 'Oxford Navy & Gold',
    theme: {
      primary: '#1E3A8A',
      primaryHover: '#172554',
      secondary: '#CA8A04',
      softBg: '#EFF6FF',
      softBorder: '#BFDBFE',
      textAccent: '#1E3A8A',
      gradientFrom: '#172554',
      gradientTo: '#334155',
    },
  },
];

export const AddAlmaMaterModal: React.FC<AddAlmaMaterModalProps> = ({
  open,
  onClose,
  onAddInstitution,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<Institution['type']>('University');
  const [location, setLocation] = useState('');
  const [degree, setDegree] = useState('');
  const [department, setDepartment] = useState('');
  const [batchYear, setBatchYear] = useState('2024');
  const [themeId, setThemeId] = useState('navy');

  // Verification state
  const [method, setMethod] = useState<'email' | 'roll' | 'peer'>('email');
  const [eduEmail, setEduEmail] = useState('rohan.sharma@alumni.stanford.edu');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [rollNumber, setRollNumber] = useState('EX-2024-1104');
  const [rollVerified, setRollVerified] = useState(false);
  const [selectedPeers, setSelectedPeers] = useState<string[]>(['Ananya Deshmukh', 'Vikram Nair']);
  const [peerConfirmed, setPeerConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetAndClose = () => {
    setStep(1);
    setName('');
    setLocation('');
    setDegree('');
    setDepartment('');
    setOtpSent(false);
    setOtpCode('');
    setRollVerified(false);
    setPeerConfirmed(false);
    setErrorMsg('');
    onClose();
  };

  const applyPreset = (preset: (typeof PRESET_CAMPUSES)[number]) => {
    setName(preset.name);
    setType(preset.type);
    setLocation(preset.location);
    setEduEmail(`rohan.sharma@${preset.domain}`);
    if (!degree) {
      setDegree(
        preset.type === 'High School'
          ? 'Higher Secondary'
          : preset.type === 'Business School'
          ? 'Executive Certificate'
          : 'Visiting Fellow / MS'
      );
    }
    if (!department) {
      setDepartment('Computer Science & Product');
    }
  };

  const handleContinueToVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !degree.trim() || !batchYear.trim()) {
      setErrorMsg('Please fill in institution name, degree/program, and graduation year.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const canCompleteVerification =
    (method === 'email' && otpSent && otpCode.trim().length >= 4) ||
    (method === 'roll' && rollVerified) ||
    (method === 'peer' && peerConfirmed);

  const handleComplete = () => {
    if (!canCompleteVerification) {
      setErrorMsg('Please complete the verification check above to proceed.');
      return;
    }
    const chosenTheme =
      THEME_PRESETS.find((t) => t.id === themeId)?.theme ?? THEME_PRESETS[2].theme;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-3)}`;

    const newInst: Institution = {
      id: slug,
      name: name.trim(),
      shortName: name.trim().length > 18 ? name.trim().slice(0, 18) : name.trim(),
      type,
      location: location.trim() || 'India',
      foundedYear: 1965,
      motto: 'Verified Alumni Community',
      bannerUrl: UNIFIED_BANNER_URL,
      crestVariant: 'columns',
      theme: chosenTheme,
      verifiedCount: 4280,
      activeBatchRate: 74,
      userCredential: {
        degree: degree.trim(),
        department: department.trim() || 'General Studies',
        batchYear: Number(batchYear) || 2024,
        rollNumber: rollNumber.trim() || `ALM-${batchYear}-0941`,
        verificationMethod:
          method === 'email'
            ? 'Official Email'
            : method === 'roll'
            ? 'Roll Number Registry'
            : 'Peer Vouched',
        verifiedSince: 'Nov 2026',
        campusAccessCode: `${name.slice(0, 3).toUpperCase()}-${batchYear.slice(-2)}-941`,
      },
    };

    onAddInstitution(newInst);
    setStep(3);
  };

  return (
    <ModalShell
      open={open}
      onClose={resetAndClose}
      title="Add Another School or College"
      subtitle="Link a new verified institution to Rohan Sharma's unified AlmaOne identity."
      maxWidthClass="max-w-xl"
    >
      {/* Stepper Indicator */}
      <div className="flex items-center gap-3 text-xs text-slate-500 pb-5 mb-5 border-b border-slate-100">
        <span className={step >= 1 ? 'font-semibold text-slate-900' : ''}>
          1. Institution Details
        </span>
        <span aria-hidden="true">/</span>
        <span className={step >= 2 ? 'font-semibold text-slate-900' : ''}>
          2. Alumni Verification
        </span>
        <span aria-hidden="true">/</span>
        <span className={step === 3 ? 'font-semibold text-emerald-700' : ''}>
          3. Workspace Linked
        </span>
      </div>

      {step === 1 && (
        <form onSubmit={handleContinueToVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Quick-select popular campus or enter manually
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_CAMPUSES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                    name === p.name
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{p.location}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Institution Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., IIT Bombay"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Institution Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Institution['type'])}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-slate-400"
              >
                <option value="University">University</option>
                <option value="Engineering Institute">Engineering Institute</option>
                <option value="Business School">Business School</option>
                <option value="High School">High School</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Degree / Program
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g., Executive Program in AI"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                min={1960}
                max={2030}
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Department / Stream
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Computer Science"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campus City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Mumbai, Maharashtra"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Workspace Color Theme
            </label>
            <div className="flex items-center gap-2">
              {THEME_PRESETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    themeId === t.id
                      ? 'border-slate-900 bg-slate-50 text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: t.theme.primary }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
            >
              Continue to Verification
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            Verifying <span className="font-semibold text-slate-900">{name}</span> · {degree} · Class of{' '}
            <span className="font-mono">{batchYear}</span>
          </div>

          {/* 3 Verification Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'email', label: '.edu / .ac.in Email', icon: Mail },
                { id: 'roll', label: 'Roll Number Check', icon: Hash },
                { id: 'peer', label: 'Peer Vouching', icon: Users },
              ] as const
            ).map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    method === m.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1.5" />
                  <div className="text-xs font-semibold leading-tight">{m.label}</div>
                </button>
              );
            })}
          </div>

          {method === 'email' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Official Institutional Email (.edu / .ac.in)
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={eduEmail}
                    onChange={(e) => setEduEmail(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(true);
                      setOtpCode('482910');
                    }}
                    className="px-3.5 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 whitespace-nowrap"
                  >
                    {otpSent ? 'Resend Code' : 'Send OTP'}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="text-xs text-emerald-800">
                    Simulated 6-digit verification code sent to <span className="font-mono">{eduEmail}</span> (auto-filled for demo).
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-44 h-9 px-3 rounded-lg border border-emerald-300 bg-white font-mono text-sm tracking-widest"
                  />
                </div>
              )}
            </div>
          )}

          {method === 'roll' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Student Roll Number / Alumni Registry ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => {
                      setRollNumber(e.target.value);
                      setRollVerified(false);
                    }}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setRollVerified(true)}
                    className="px-3.5 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 whitespace-nowrap"
                  >
                    Verify Registry
                  </button>
                </div>
              </div>
              {rollVerified && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Exact Registrar Match found for <span className="font-mono font-semibold">{rollNumber}</span> (Batch {batchYear}).
                </div>
              )}
            </div>
          )}

          {method === 'peer' && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-600">
                Select at least 2 verified classmates on AlmaOne to vouch for your enrollment.
              </p>
              <div className="space-y-1.5">
                {['Ananya Deshmukh', 'Vikram Nair', 'Meera Krishnan'].map((peer) => {
                  const checked = selectedPeers.includes(peer);
                  return (
                    <label
                      key={peer}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{peer}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedPeers((prev) =>
                            checked ? prev.filter((p) => p !== peer) : [...prev, peer]
                          )
                        }
                        className="rounded border-slate-300"
                      />
                    </label>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={selectedPeers.length < 2}
                onClick={() => setPeerConfirmed(true)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-800"
              >
                {peerConfirmed ? '2/2 Peer Vouches Confirmed' : 'Send & Simulate Peer Vouch'}
              </button>
              {peerConfirmed && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {selectedPeers.slice(0, 2).join(' and ')} confirmed your batch enrollment.
                </div>
              )}
            </div>
          )}

          {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={!canCompleteVerification}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-medium transition-colors"
            >
              Verify & Link Institution
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-4 space-y-3">
          <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {name} is now verified on your profile
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Your workspace switcher, unified feed, and Digital Alumni ID card have been updated automatically.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
            >
              Open Workspace
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};
