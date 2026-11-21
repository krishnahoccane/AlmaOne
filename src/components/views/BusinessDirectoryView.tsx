import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Plus, Search } from 'lucide-react';
import {
  AlumniBusiness,
  Alumnus,
  Institution,
  InstitutionTheme,
  WorkspaceId,
} from '../../types/alumni';
import { EmptyState, ModalShell } from '../ui/CommonUI';

interface BusinessDirectoryViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  businesses: AlumniBusiness[];
  alumni: Alumnus[];
  theme: InstitutionTheme;
  onAddBusiness: (biz: Omit<AlumniBusiness, 'id'>) => void;
  onOpenAlumnus: (alumnus: Alumnus) => void;
}

const CATEGORIES: Array<'All' | AlumniBusiness['category']> = [
  'All',
  'SaaS & AI',
  'FinTech',
  'Consumer & D2C',
  'Advisory & Agencies',
  'HealthTech',
];

export const BusinessDirectoryView: React.FC<BusinessDirectoryViewProps> = ({
  activeWorkspace,
  institutions,
  businesses,
  alumni,
  theme,
  onAddBusiness,
  onOpenAlumnus,
}) => {
  const [category, setCategory] = useState<'All' | AlumniBusiness['category']>('All');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // New Business Form
  const [bizName, setBizName] = useState('');
  const [bizTagline, setBizTagline] = useState('');
  const [bizCat, setBizCat] = useState<AlumniBusiness['category']>('SaaS & AI');
  const [bizCity, setBizCity] = useState('Bengaluru');
  const [bizWebsite, setBizWebsite] = useState('');
  const [bizCode, setBizCode] = useState('ALUMNI20');
  const [bizOffer, setBizOffer] = useState('20% off annual plans for verified alumni');
  const [bizInstId, setBizInstId] = useState(
    activeWorkspace === 'all' ? institutions[0]?.id ?? 'nit-warangal' : activeWorkspace
  );

  const visibleBusinesses = businesses.filter((b) => {
    const matchesWorkspace = activeWorkspace === 'all' || b.institutionId === activeWorkspace;
    const matchesCat = category === 'All' || b.category === category;
    const matchesQuery =
      !query.trim() ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.tagline.toLowerCase().includes(query.toLowerCase()) ||
      b.founderName.toLowerCase().includes(query.toLowerCase());
    return matchesWorkspace && matchesCat && matchesQuery;
  });

  const handleCopyCode = (biz: AlumniBusiness) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(biz.discountCode).catch(() => {});
    }
    setCopiedId(biz.id);
    window.setTimeout(() => setCopiedId((prev) => (prev === biz.id ? null : prev)), 2000);
  };

  const handleSubmitBiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !bizTagline.trim()) return;
    const inst = institutions.find((i) => i.id === bizInstId);
    onAddBusiness({
      name: bizName.trim(),
      tagline: bizTagline.trim(),
      category: bizCat,
      institutionId: bizInstId,
      founderId: 'rohan-sharma',
      founderName: 'Rohan Sharma',
      founderBatch: inst
        ? `${inst.shortName} · ’${String(inst.userCredential.batchYear).slice(-2)}`
        : 'Verified Alumnus',
      city: bizCity.trim() || 'Bengaluru',
      website: bizWebsite.trim() || 'example.com',
      discountCode: bizCode.trim().toUpperCase() || 'ALMA20',
      discountOffer: bizOffer.trim() || 'Exclusive alumni partner benefit',
      description: bizTagline.trim(),
    });
    setBizName('');
    setBizTagline('');
    setBizWebsite('');
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Alumni Business & Startup Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Discover alumni-founded companies, boutique agencies, and member-exclusive perks
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white whitespace-nowrap self-start sm:self-auto"
          style={{ backgroundColor: theme.primary }}
        >
          <Plus className="w-3.5 h-3.5" />
          List Your Venture
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search startup or founder..."
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Directory Grid */}
      {visibleBusinesses.length === 0 ? (
        <EmptyState
          title="No alumni businesses match this filter"
          description="Try selecting All categories or clearing your search query."
          actionLabel="Show All Businesses"
          onAction={() => {
            setCategory('All');
            setQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleBusinesses.map((biz) => {
            const founderAlum = alumni.find((a) => a.id === biz.founderId);
            const isCopied = copiedId === biz.id;
            return (
              <div
                key={biz.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {biz.category} · {biz.city}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                      {biz.website}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{biz.name}</h3>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">{biz.tagline}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{biz.description}</p>

                  <div className="text-xs text-slate-500">
                    Founded by{' '}
                    <button
                      type="button"
                      onClick={() => founderAlum && onOpenAlumnus(founderAlum)}
                      className={`font-semibold text-slate-900 ${founderAlum ? 'hover:underline' : ''}`}
                    >
                      {biz.founderName}
                    </button>{' '}
                    ({biz.founderBatch})
                  </div>
                </div>

                {/* Exclusive Alumni Perk Bar */}
                <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-emerald-700">
                      Exclusive Alumni Perk
                    </div>
                    <div className="text-xs text-slate-700 truncate">{biz.discountOffer}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(biz)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 font-mono text-xs font-semibold text-slate-900 shrink-0 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        {biz.discountCode}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Venture Modal */}
      <ModalShell
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="List Your Business or Startup"
        subtitle="Feature your company in the verified Alumni Directory with an optional alumni perk."
      >
        <form onSubmit={handleSubmitBiz} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="e.g., Northstar Analytics"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={bizCat}
                onChange={(e) => setBizCat(e.target.value as AlumniBusiness['category'])}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              One-line Description
            </label>
            <input
              type="text"
              required
              value={bizTagline}
              onChange={(e) => setBizTagline(e.target.value)}
              placeholder="What does your business build or offer?"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={bizCity}
                onChange={(e) => setBizCity(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={bizWebsite}
                onChange={(e) => setBizWebsite(e.target.value)}
                placeholder="company.com"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Campus</label>
              <select
                value={bizInstId}
                onChange={(e) => setBizInstId(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Discount Code
              </label>
              <input
                type="text"
                value={bizCode}
                onChange={(e) => setBizCode(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Alumni Perk Details
              </label>
              <input
                type="text"
                value={bizOffer}
                onChange={(e) => setBizOffer(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium text-white"
              style={{ backgroundColor: theme.primary }}
            >
              Add to Directory
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
