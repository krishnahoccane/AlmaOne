import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  Megaphone,
  Send,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import {
  BroadcastRecord,
  Institution,
  VerificationRequest,
  WorkspaceId,
} from '../../types/alumni';
import { EmptyState } from '../ui/CommonUI';

interface AdminPortalViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  verificationRequests: VerificationRequest[];
  broadcasts: BroadcastRecord[];
  onApproveVerification: (requestId: string) => void;
  onRejectVerification: (requestId: string) => void;
  onSendBroadcast: (payload: {
    institutionId: string;
    title: string;
    body: string;
    targetBatch: string;
    targetDepartment: string;
    targetCity: string;
    estimatedReach: number;
  }) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  activeWorkspace,
  institutions,
  verificationRequests,
  broadcasts,
  onApproveVerification,
  onRejectVerification,
  onSendBroadcast,
}) => {
  const [adminInstId, setAdminInstId] = useState<string>(
    activeWorkspace === 'all' ? institutions[1]?.id ?? institutions[0]?.id ?? '' : activeWorkspace
  );
  const [adminTab, setAdminTab] = useState<'queue' | 'analytics' | 'broadcast'>('queue');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');

  // Broadcast form state
  const [bcTitle, setBcTitle] = useState('');
  const [bcBody, setBcBody] = useState('');
  const [bcBatch, setBcBatch] = useState('All Batches');
  const [bcDept, setBcDept] = useState('All Departments');
  const [bcCity, setBcCity] = useState('All Cities');

  React.useEffect(() => {
    if (activeWorkspace !== 'all') {
      setAdminInstId(activeWorkspace);
    }
  }, [activeWorkspace]);

  const activeInst =
    institutions.find((i) => i.id === adminInstId) ?? institutions[0];

  const scopedRequests = useMemo(() => {
    return verificationRequests.filter((r) => {
      const matchesInst = r.institutionId === activeInst?.id;
      const matchesStatus = statusFilter === 'all' || r.status === 'pending';
      return matchesInst && matchesStatus;
    });
  }, [verificationRequests, activeInst, statusFilter]);

  const pendingCountForInst = verificationRequests.filter(
    (r) => r.institutionId === activeInst?.id && r.status === 'pending'
  ).length;

  const estimatedReach = useMemo(() => {
    if (!activeInst) return 0;
    let base = activeInst.verifiedCount;
    if (bcBatch !== 'All Batches') base = Math.round(base * 0.28);
    if (bcDept !== 'All Departments') base = Math.round(base * 0.34);
    if (bcCity !== 'All Cities') base = Math.round(base * 0.24);
    return Math.max(48, base);
  }, [activeInst, bcBatch, bcDept, bcCity]);

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInst || !bcTitle.trim() || !bcBody.trim()) return;
    onSendBroadcast({
      institutionId: activeInst.id,
      title: bcTitle.trim(),
      body: bcBody.trim(),
      targetBatch: bcBatch,
      targetDepartment: bcDept,
      targetCity: bcCity,
      estimatedReach,
    });
    setBcTitle('');
    setBcBody('');
  };

  if (!activeInst) return null;

  // Institutional engagement analytics mock breakdowns tied to selected institution
  const topCities = [
    { city: 'Bengaluru', count: Math.round(activeInst.verifiedCount * 0.31) },
    { city: 'Hyderabad', count: Math.round(activeInst.verifiedCount * 0.22) },
    { city: 'Mumbai', count: Math.round(activeInst.verifiedCount * 0.18) },
    { city: 'Delhi NCR', count: Math.round(activeInst.verifiedCount * 0.13) },
    { city: 'San Francisco Bay Area', count: Math.round(activeInst.verifiedCount * 0.09) },
  ];

  const topEmployers = [
    { company: 'Google', count: Math.round(activeInst.verifiedCount * 0.042) },
    { company: 'Microsoft', count: Math.round(activeInst.verifiedCount * 0.038) },
    { company: 'Amazon', count: Math.round(activeInst.verifiedCount * 0.034) },
    { company: 'McKinsey & Co.', count: Math.round(activeInst.verifiedCount * 0.029) },
    { company: 'Razorpay', count: Math.round(activeInst.verifiedCount * 0.024) },
  ];

  const batchActivation = [
    { year: '2014', pct: Math.min(96, activeInst.activeBatchRate - 6) },
    { year: '2016', pct: Math.min(96, activeInst.activeBatchRate - 2) },
    { year: '2018', pct: Math.min(96, activeInst.activeBatchRate + 5) },
    { year: '2020', pct: Math.min(96, activeInst.activeBatchRate + 8) },
    { year: '2022', pct: Math.min(96, activeInst.activeBatchRate + 11) },
    { year: '2024', pct: Math.min(96, activeInst.activeBatchRate + 4) },
  ];

  const instBroadcasts = broadcasts.filter((b) => b.institutionId === activeInst.id);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Institutional Admin Portal (B2B View)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {activeInst.name} — Alumni Office Console
          </h1>
          <p className="text-xs text-slate-300">
            Audit alumni verification claims, monitor cohort activation, and dispatch segmented campus broadcasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-slate-300" htmlFor="admin-inst-select">
            Managing Campus:
          </label>
          <select
            id="admin-inst-select"
            value={activeInst.id}
            onChange={(e) => setAdminInstId(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-white focus:outline-none"
          >
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setAdminTab('queue')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            adminTab === 'queue'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Verification Queue ({pendingCountForInst})
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('analytics')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            adminTab === 'analytics'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Engagement Analytics
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('broadcast')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            adminTab === 'broadcast'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          Broadcast Center
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {adminTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Alumni Identity Verification Queue
              </h2>
              <p className="text-xs text-slate-500">
                Cross-checked automatically against Registrar Roll Number records and peer vouches
              </p>
            </div>
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  statusFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Pending ({pendingCountForInst})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                All Requests
              </button>
            </div>
          </div>

          {scopedRequests.length === 0 ? (
            <EmptyState
              title="Verification queue is clear"
              description={`All pending alumni claims for ${activeInst.name} have been reviewed.`}
              actionLabel={statusFilter === 'pending' ? 'View Processed History' : undefined}
              onAction={statusFilter === 'pending' ? () => setStatusFilter('all') : undefined}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-medium text-slate-500">
                      <th className="py-3 px-5">Applicant</th>
                      <th className="py-3 px-4">Claimed Program & Batch</th>
                      <th className="py-3 px-4">Roll No. Match</th>
                      <th className="py-3 px-4">Peer Vouches</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {scopedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">{req.applicantName}</div>
                          <div className="text-[11px] font-mono text-slate-500">{req.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">
                            {req.claimedDegree} · {req.claimedBatch}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {req.claimedDepartment}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-medium text-slate-800 tabular-nums">
                            {req.rollNumber}
                          </div>
                          <div
                            className={`text-[11px] font-semibold ${
                              req.rollMatchStatus === 'Exact Match'
                                ? 'text-emerald-700'
                                : req.rollMatchStatus === 'Partial Match'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {req.rollMatchStatus}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-semibold text-slate-800 tabular-nums">
                            {req.peerVouches} / 2 vouches
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {req.peerVouchNames.length > 0
                              ? req.peerVouchNames.join(', ')
                              : 'No peer vouches yet'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs font-semibold capitalize ${
                              req.status === 'approved'
                                ? 'text-emerald-700'
                                : req.status === 'rejected'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {req.status}
                          </span>
                          <div className="text-[11px] text-slate-400 tabular-nums">
                            {req.submittedAt}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {req.status === 'pending' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onApproveVerification(req.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium whitespace-nowrap"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => onRejectVerification(req.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-medium whitespace-nowrap"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENGAGEMENT ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="space-y-5">
          {/* 4-Column KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Verified Alumni</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {activeInst.verifiedCount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1 tabular-nums">
                +4.8% in last 30 days
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Batch Activation Rate</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {activeInst.activeBatchRate}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Verified profiles active in Q4
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Mentorship Matches</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {Math.round(activeInst.verifiedCount * 0.085).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">
                94% session completion
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Direct Referrals Placed</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {Math.round(activeInst.verifiedCount * 0.032).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across 140+ hiring partners
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Batch Activation Bar Chart */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Batch Activation Rates (%)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Percentage of graduating cohort verified & active on AlmaOne
                </p>
              </div>
              <div className="flex items-end justify-between gap-3 h-48 pt-4 px-2 border-b border-slate-100">
                {batchActivation.map((item) => (
                  <div key={item.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[11px] font-mono font-semibold text-slate-700 tabular-nums">
                      {item.pct}%
                    </span>
                    <div
                      className="w-full max-w-[38px] rounded-t-md transition-all"
                      style={{
                        height: `${item.pct}%`,
                        backgroundColor: activeInst.theme.primary,
                      }}
                    />
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums pb-1">
                      ’{item.year.slice(-2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Top Alumni Cities</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Geographic density of verified graduates
                </p>
              </div>
              <div className="space-y-3.5">
                {topCities.map((c) => {
                  const pct = Math.round((c.count / activeInst.verifiedCount) * 100);
                  return (
                    <div key={c.city} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{c.city}</span>
                        <span className="font-mono text-slate-600 tabular-nums">
                          {c.count.toLocaleString('en-IN')} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, pct * 2.5)}%`,
                            backgroundColor: activeInst.theme.primary,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Employers */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Top Employers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Highest alumni concentration</p>
              </div>
              <div className="divide-y divide-slate-100">
                {topEmployers.map((emp, idx) => (
                  <div
                    key={emp.company}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-800 font-medium">
                      <span className="font-mono text-slate-400 mr-2 tabular-nums">
                        0{idx + 1}
                      </span>
                      {emp.company}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {emp.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST CENTER */}
      {adminTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Broadcast Composer */}
          <form
            onSubmit={handlePublishBroadcast}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Compose Segmented Campus Broadcast
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Published announcements appear immediately in the target campus Home Feed with official verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Batch
                </label>
                <select
                  value={bcBatch}
                  onChange={(e) => setBcBatch(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="All Batches">All Batches</option>
                  <option value="2010 – 2015">2010 – 2015</option>
                  <option value="2016 – 2020">2016 – 2020</option>
                  <option value="2021 – 2025">2021 – 2025</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Department / Stream
                </label>
                <select
                  value={bcDept}
                  onChange={(e) => setBcDept(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Computer Science & Engineering">Computer Science</option>
                  <option value="Strategy & Product Leadership">Strategy & Product</option>
                  <option value="Science & Mathematics">Science & Mathematics</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City / Chapter
                </label>
                <select
                  value={bcCity}
                  onChange={(e) => setBcCity(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="All Cities">All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="San Francisco Bay Area">Bay Area</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Announcement Subject
              </label>
              <input
                type="text"
                required
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                placeholder="e.g., Annual Alumni Mentorship Cohort — Call for Mentors"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Message Body
              </label>
              <textarea
                rows={4}
                required
                value={bcBody}
                onChange={(e) => setBcBody(e.target.value)}
                placeholder="Write your official institutional update..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Estimated Reach:{' '}
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {estimatedReach.toLocaleString('en-IN')} verified alumni
                </span>
              </div>
              <button
                type="submit"
                disabled={!bcTitle.trim() || !bcBody.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: activeInst.theme.primary }}
              >
                <Send className="w-3.5 h-3.5" />
                Publish Broadcast to Feed
              </button>
            </div>
          </form>

          {/* Live Preview & History */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="text-xs font-semibold text-slate-500">Live Member Feed Preview</div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: activeInst.theme.primary }}
                >
                  Campus Broadcast · {bcBatch} · {bcCity}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {bcTitle.trim() || 'Your announcement headline will appear here'}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {bcBody.trim() ||
                    'Compose a message on the left to preview how verified alumni will see it across their Home Feed and email digest.'}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  {activeInst.name} Alumni Office · Just now
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-900">
                Recent Broadcasts ({instBroadcasts.length})
              </h3>
              {instBroadcasts.length === 0 ? (
                <p className="text-xs text-slate-500">No broadcasts dispatched for this campus yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {instBroadcasts.map((bc) => (
                    <div key={bc.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="text-xs font-semibold text-slate-900">{bc.title}</div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {bc.targetBatch} · {bc.targetCity} · {bc.estimatedReach.toLocaleString('en-IN')} reached ·{' '}
                        {bc.sentAt}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
