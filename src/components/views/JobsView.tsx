import React, { useState } from 'react';
import { Briefcase, CheckCircle2, MapPin, Plus, Search } from 'lucide-react';
import {
  Alumnus,
  Institution,
  InstitutionTheme,
  JobListing,
  WorkspaceId,
} from '../../types/alumni';
import { EmptyState, ModalShell } from '../ui/CommonUI';

interface JobsViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  jobs: JobListing[];
  alumni: Alumnus[];
  theme: InstitutionTheme;
  onRequestReferral: (jobId: string, note: string, resumeName: string) => void;
  onPostJob: (job: Omit<JobListing, 'id' | 'postedAt' | 'applicantsCount'>) => void;
  onOpenAlumnus: (alumnus: Alumnus) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  activeWorkspace,
  institutions,
  jobs,
  alumni,
  theme,
  onRequestReferral,
  onPostJob,
  onOpenAlumnus,
}) => {
  const [query, setQuery] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [referralOnly, setReferralOnly] = useState(false);

  // Detail & Referral Modal
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [referralNote, setReferralNote] = useState('');
  const [resumeFile, setResumeFile] = useState('Rohan_Sharma_Product_Resume_2026.pdf');

  // Post Job Modal
  const [postOpen, setPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('Razorpay');
  const [newLocation, setNewLocation] = useState('Bengaluru, India');
  const [newWorkMode, setNewWorkMode] = useState<JobListing['workMode']>('Hybrid');
  const [newEmpType, setNewEmpType] = useState<JobListing['employmentType']>('Full-time');
  const [newComp, setNewComp] = useState('₹45L – ₹60L + ESOPs');
  const [newExp, setNewExp] = useState('4–7 years');
  const [newInstId, setNewInstId] = useState(
    activeWorkspace === 'all' ? institutions[0]?.id ?? 'nit-warangal' : activeWorkspace
  );
  const [newDirectRef, setNewDirectRef] = useState(true);
  const [newDesc, setNewDesc] = useState('');

  const visibleJobs = jobs.filter((job) => {
    const matchesWorkspace = activeWorkspace === 'all' || job.institutionId === activeWorkspace;
    const matchesQuery =
      !query.trim() ||
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.location.toLowerCase().includes(query.toLowerCase());
    const matchesType = employmentFilter === 'all' || job.employmentType === employmentFilter;
    const matchesRef = !referralOnly || job.directReferral;
    return matchesWorkspace && matchesQuery && matchesType && matchesRef;
  });

  const handleSubmitReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    onRequestReferral(
      selectedJob.id,
      referralNote.trim() || 'Interested in this role via AlmaOne alumni network.',
      resumeFile
    );
    setReferralNote('');
    setSelectedJob(null);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newDesc.trim()) return;
    const inst = institutions.find((i) => i.id === newInstId);
    onPostJob({
      title: newTitle.trim(),
      company: newCompany.trim(),
      location: newLocation.trim() || 'Bengaluru, India',
      workMode: newWorkMode,
      employmentType: newEmpType,
      experienceLevel: newExp.trim() || '3–6 years',
      compensation: newComp.trim() || 'Competitive + Equity',
      institutionId: newInstId,
      postedById: 'rohan-sharma',
      postedByName: 'Rohan Sharma',
      postedByRole: 'Group Product Manager at Razorpay',
      postedByBatch: inst
        ? `${inst.shortName} ’${String(inst.userCredential.batchYear).slice(-2)}`
        : 'Verified Alumnus',
      directReferral: newDirectRef,
      description: newDesc.trim(),
      requirements: [
        'Strong product or technical execution track record',
        'High ownership in fast-moving collaborative teams',
      ],
    });
    setNewTitle('');
    setNewDesc('');
    setPostOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Jobs & Alumni Referrals
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
            {visibleJobs.length} open opportunities posted directly by verified alumni
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPostOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors whitespace-nowrap self-start sm:self-auto"
          style={{ backgroundColor: theme.primary }}
        >
          <Plus className="w-3.5 h-3.5" />
          Post a Job
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search role, company, or city..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            {['all', 'Full-time', 'Founding Team', 'Leadership'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setEmploymentFilter(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  employmentFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Roles' : t}
              </button>
            ))}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={referralOnly}
            onChange={(e) => setReferralOnly(e.target.checked)}
            className="rounded border-slate-300"
          />
          Direct Referral Available only
        </label>
      </div>

      {/* Job Listings */}
      {visibleJobs.length === 0 ? (
        <EmptyState
          title="No jobs match your filters"
          description="Clear search or role filters to view all alumni-posted openings."
          actionLabel="Reset Filters"
          onAction={() => {
            setQuery('');
            setEmploymentFilter('all');
            setReferralOnly(false);
          }}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {visibleJobs.map((job) => {
            const inst = institutions.find((i) => i.id === job.institutionId);
            const posterAlum = alumni.find((a) => a.id === job.postedById);
            return (
              <div
                key={job.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">{job.company}</span>
                    <span aria-hidden="true">·</span>
                    <span>{job.employmentType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{inst?.shortName ?? 'Alumni Network'}</span>
                    {job.directReferral && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-emerald-700">
                          Direct Referral Available
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="text-left group"
                  >
                    <h3 className="text-base font-semibold text-slate-900 group-hover:underline">
                      {job.title}
                    </h3>
                  </button>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location} ({job.workMode})
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {job.experienceLevel}
                    </span>
                    <span className="font-mono font-medium text-slate-800 tabular-nums">
                      {job.compensation}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-0.5">
                    Posted by{' '}
                    <button
                      type="button"
                      onClick={() => posterAlum && onOpenAlumnus(posterAlum)}
                      className={`font-medium text-slate-800 ${posterAlum ? 'hover:underline' : ''}`}
                    >
                      {job.postedByName}
                    </button>{' '}
                    ({job.postedByBatch}) · {job.postedAt} ·{' '}
                    <span className="tabular-nums">{job.applicantsCount} applicants</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {job.referralRequested ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Referral Requested
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors whitespace-nowrap"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {job.directReferral ? 'View & Request Referral' : 'View Details'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Detail & Request Referral Modal */}
      <ModalShell
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title ?? ''}
        subtitle={
          selectedJob
            ? `${selectedJob.company} · ${selectedJob.location} · ${selectedJob.compensation}`
            : ''
        }
        maxWidthClass="max-w-xl"
      >
        {selectedJob && (
          <div className="space-y-5">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-900">
                  Posted by {selectedJob.postedByName}
                </div>
                <div className="text-slate-500 mt-0.5">
                  {selectedJob.postedByRole} · {selectedJob.postedByBatch}
                </div>
              </div>
              {selectedJob.directReferral && (
                <span className="font-semibold text-emerald-700 shrink-0">
                  Direct Referral Eligible
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-900">Role Overview</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedJob.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-900">What we look for</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                {selectedJob.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            {selectedJob.referralRequested ? (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Your referral request has been sent to {selectedJob.postedByName}.
              </div>
            ) : (
              <form onSubmit={handleSubmitReferral} className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-900">
                  Request Alumni Referral from {selectedJob.postedByName}
                </h4>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Attached Resume / Profile PDF
                  </label>
                  <input
                    type="text"
                    value={resumeFile}
                    onChange={(e) => setResumeFile(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Personal Note (highlight relevant work & shared campus context)
                  </label>
                  <textarea
                    rows={3}
                    value={referralNote}
                    onChange={(e) => setReferralNote(e.target.value)}
                    placeholder={`Hi ${selectedJob.postedByName.split(' ')[0]}, I'd love to be considered for this role...`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Submit Referral Request
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </ModalShell>

      {/* Post a Job Modal */}
      <ModalShell
        open={postOpen}
        onClose={() => setPostOpen(false)}
        title="Post an Alumni Job Opening"
        subtitle="Share a role on your team and optionally offer direct internal referrals."
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleCreateJob} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Senior Backend Engineer"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Mode</label>
              <select
                value={newWorkMode}
                onChange={(e) => setNewWorkMode(e.target.value as JobListing['workMode'])}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role Type</label>
              <select
                value={newEmpType}
                onChange={(e) => setNewEmpType(e.target.value as JobListing['employmentType'])}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                <option value="Full-time">Full-time</option>
                <option value="Founding Team">Founding Team</option>
                <option value="Leadership">Leadership</option>
                <option value="Advisory">Advisory</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Compensation</label>
              <input
                type="text"
                value={newComp}
                onChange={(e) => setNewComp(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Experience</label>
              <input
                type="text"
                value={newExp}
                onChange={(e) => setNewExp(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Campus
              </label>
              <select
                value={newInstId}
                onChange={(e) => setNewInstId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Role Description
            </label>
            <textarea
              rows={3}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe the team mission, impact, and key responsibilities..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={newDirectRef}
              onChange={(e) => setNewDirectRef(e.target.checked)}
              className="rounded border-slate-300"
            />
            Mark as Direct Referral Available (applicants can submit notes to you directly)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPostOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium text-white"
              style={{ backgroundColor: theme.primary }}
            >
              Publish Job Listing
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
