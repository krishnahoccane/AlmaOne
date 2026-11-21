import React, { useState } from 'react';
import { Award, CheckCircle2, HeartHandshake } from 'lucide-react';
import {
  BatchGivingEntry,
  FundraisingCampaign,
  Institution,
  InstitutionTheme,
  WorkspaceId,
} from '../../types/alumni';
import { formatInrCompact } from '../../data/mockData';
import { ModalShell } from '../ui/CommonUI';

interface GivingViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  campaigns: FundraisingCampaign[];
  leaderboard: BatchGivingEntry[];
  theme: InstitutionTheme;
  onDonate: (payload: {
    campaignId: string;
    amountInr: number;
    batchYear: number;
    anonymous: boolean;
  }) => void;
}

const PRESET_AMOUNTS = [5000, 15000, 50000, 150000];

export const GivingView: React.FC<GivingViewProps> = ({
  activeWorkspace,
  institutions,
  campaigns,
  leaderboard,
  theme,
  onDonate,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<FundraisingCampaign | null>(null);
  const [amount, setAmount] = useState<number>(15000);
  const [anonymous, setAnonymous] = useState(false);
  const [confirmedReceipt, setConfirmedReceipt] = useState<string | null>(null);

  const visibleCampaigns = campaigns.filter(
    (c) => activeWorkspace === 'all' || c.institutionId === activeWorkspace
  );

  const visibleLeaderboard = leaderboard
    .filter((entry) => activeWorkspace === 'all' || entry.institutionId === activeWorkspace)
    .sort((a, b) => b.participationPct - a.participationPct);

  const totalRaised = visibleCampaigns.reduce((s, c) => s + c.raisedAmountInr, 0);
  const totalDonors = visibleCampaigns.reduce((s, c) => s + c.donorCount, 0);

  const handleConfirmDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || amount <= 0) return;
    const inst = institutions.find((i) => i.id === selectedCampaign.institutionId);
    const batchYear = inst?.userCredential.batchYear ?? 2018;
    onDonate({
      campaignId: selectedCampaign.id,
      amountInr: amount,
      batchYear,
      anonymous,
    });
    setConfirmedReceipt(`80G-ALMA-${Date.now().toString().slice(-6)}`);
  };

  const closeDonateModal = () => {
    setSelectedCampaign(null);
    setConfirmedReceipt(null);
    setAmount(15000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Giving & Endowment Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Direct 100% transparent support for student scholarships, research labs, and campus heritage
          </p>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {formatInrCompact(totalRaised)}
            </div>
            <div className="text-[11px] text-slate-500">Total Raised (FY26)</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {totalDonors.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500">Verified Donors</div>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {visibleCampaigns.map((camp) => {
          const inst = institutions.find((i) => i.id === camp.institutionId);
          const pct = Math.min(100, Math.round((camp.raisedAmountInr / camp.goalAmountInr) * 100));
          return (
            <div
              key={camp.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
                  {inst?.shortName ?? 'Campus Fund'} · {camp.category} ·{' '}
                  <span className="tabular-nums">{camp.daysLeft} days left</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {camp.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{camp.summary}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatInrCompact(camp.raisedAmountInr)}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {pct}% of {formatInrCompact(camp.goalAmountInr)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: inst?.theme.primary ?? theme.primary,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                    <span>{camp.donorCount} alumni contributors</span>
                    <span>{camp.impactNote}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaign(camp);
                    setConfirmedReceipt(null);
                  }}
                  className="w-full py-2 rounded-lg text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: inst?.theme.primary ?? theme.primary }}
                >
                  Contribute to Fund
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gamified Batch-Wise Giving Leaderboard */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Batch-Wise Giving Leaderboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by verified batch participation rate across graduation cohorts
            </p>
          </div>
          <span className="text-xs text-slate-500">
            80G Tax Exemption Eligible
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-500 bg-slate-50/60">
                <th className="py-3 px-6">Rank</th>
                <th className="py-3 px-4">Cohort / Batch</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Participation Rate</th>
                <th className="py-3 px-4 text-right">Donors</th>
                <th className="py-3 px-6 text-right">Total Raised</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {visibleLeaderboard.map((entry, idx) => {
                const inst = institutions.find((i) => i.id === entry.institutionId);
                const isUserBatch = inst?.userCredential.batchYear === entry.batchYear;
                return (
                  <tr
                    key={`${entry.institutionId}-${entry.batchYear}`}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isUserBatch ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6 font-mono font-semibold text-slate-700 tabular-nums">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      Class of {entry.batchYear}
                      {isUserBatch && (
                        <span className="ml-2 font-normal text-xs text-slate-500">(Your Batch)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inst?.name ?? entry.institutionId}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, entry.participationPct)}%`,
                              backgroundColor: inst?.theme.primary ?? theme.primary,
                            }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-slate-800 tabular-nums">
                          {entry.participationPct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                      {entry.donorsCount}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatInrCompact(entry.totalRaisedInr)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Donation Modal */}
      <ModalShell
        open={!!selectedCampaign}
        onClose={closeDonateModal}
        title={confirmedReceipt ? 'Contribution Confirmed' : 'Make an Alumni Contribution'}
        subtitle={selectedCampaign?.title ?? ''}
      >
        {selectedCampaign &&
          (confirmedReceipt ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Thank you for contributing ₹{amount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your contribution has been credited to your batch leaderboard and your 80G tax receipt ({confirmedReceipt}) is ready.
              </p>
              <button
                type="button"
                onClick={closeDonateModal}
                className="mt-2 px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium"
              >
                Return to Campaigns
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmDonation} className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{selectedCampaign.impactNote}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Choose Contribution Amount (INR)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2.5 rounded-lg border font-mono text-xs font-semibold tabular-nums transition-colors ${
                        amount === val
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Or enter custom amount (₹)
                </label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Keep my name anonymous on the public donor wall (still counts toward batch rank)
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeDonateModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  Complete Contribution · ₹{amount.toLocaleString('en-IN')}
                </button>
              </div>
            </form>
          ))}
      </ModalShell>
    </div>
  );
};
