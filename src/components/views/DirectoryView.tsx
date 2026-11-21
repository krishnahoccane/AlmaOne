import React, { useMemo, useState } from 'react';
import { LayoutGrid, MapPin, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import {
  Alumnus,
  Institution,
  InstitutionTheme,
  OpenToTag,
  WorkspaceId,
} from '../../types/alumni';
import { AlumniAvatar, EmptyState } from '../ui/CommonUI';

interface DirectoryViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  alumni: Alumnus[];
  theme: InstitutionTheme;
  onOpenAlumnus: (alumnus: Alumnus) => void;
  onToggleConnect: (alumnusId: string) => void;
}

const OPEN_TO_OPTIONS: OpenToTag[] = [
  'Hiring',
  'Open to Mentoring',
  'Available for Coffee',
  'Seeking Co-founder',
];

const CITY_COORDS: Record<string, { x: number; y: number; region: string }> = {
  Bengaluru: { x: 64, y: 69, region: 'South India' },
  Hyderabad: { x: 66, y: 60, region: 'South India' },
  Mumbai: { x: 57, y: 58, region: 'West India' },
  'Delhi NCR': { x: 63, y: 42, region: 'North India' },
  'San Francisco Bay Area': { x: 16, y: 42, region: 'North America' },
  London: { x: 43, y: 31, region: 'Europe' },
  Singapore: { x: 80, y: 74, region: 'Southeast Asia' },
};

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  activeWorkspace,
  institutions,
  alumni,
  theme,
  onOpenAlumnus,
  onToggleConnect,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [query, setQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedOpenTo, setSelectedOpenTo] = useState<OpenToTag[]>([]);
  const [focusedMapCity, setFocusedMapCity] = useState<string | null>(null);

  const scopedAlumni = useMemo(
    () =>
      alumni.filter(
        (a) =>
          activeWorkspace === 'all' ||
          a.credentials.some((c) => c.institutionId === activeWorkspace)
      ),
    [alumni, activeWorkspace]
  );

  const filterOptions = useMemo(() => {
    const batches = Array.from(
      new Set(scopedAlumni.flatMap((a) => a.credentials.map((c) => c.batchYear)))
    ).sort((a, b) => b - a);
    const depts = Array.from(
      new Set(scopedAlumni.flatMap((a) => a.credentials.map((c) => c.department)))
    ).sort();
    const cities = Array.from(new Set(scopedAlumni.map((a) => a.city))).sort();
    const industries = Array.from(new Set(scopedAlumni.map((a) => a.industry))).sort();
    const companies = Array.from(new Set(scopedAlumni.map((a) => a.company))).sort();
    return { batches, depts, cities, industries, companies };
  }, [scopedAlumni]);

  const filteredAlumni = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedAlumni.filter((a) => {
      if (
        q &&
        !a.name.toLowerCase().includes(q) &&
        !a.company.toLowerCase().includes(q) &&
        !a.role.toLowerCase().includes(q) &&
        !a.city.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (
        selectedBatch !== 'all' &&
        !a.credentials.some((c) => String(c.batchYear) === selectedBatch)
      ) {
        return false;
      }
      if (
        selectedDept !== 'all' &&
        !a.credentials.some((c) => c.department === selectedDept)
      ) {
        return false;
      }
      if (selectedCity !== 'all' && a.city !== selectedCity) return false;
      if (selectedIndustry !== 'all' && a.industry !== selectedIndustry) return false;
      if (selectedCompany !== 'all' && a.company !== selectedCompany) return false;
      if (
        selectedOpenTo.length > 0 &&
        !selectedOpenTo.every((tag) => a.openTo.includes(tag))
      ) {
        return false;
      }
      return true;
    });
  }, [
    scopedAlumni,
    query,
    selectedBatch,
    selectedDept,
    selectedCity,
    selectedIndustry,
    selectedCompany,
    selectedOpenTo,
  ]);

  const cityClusters = useMemo(() => {
    const groups: Record<string, Alumnus[]> = {};
    for (const a of filteredAlumni) {
      if (!groups[a.city]) groups[a.city] = [];
      groups[a.city].push(a);
    }
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredAlumni]);

  const activeFiltersCount =
    (selectedBatch !== 'all' ? 1 : 0) +
    (selectedDept !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0) +
    (selectedIndustry !== 'all' ? 1 : 0) +
    (selectedCompany !== 'all' ? 1 : 0) +
    selectedOpenTo.length;

  const resetFilters = () => {
    setQuery('');
    setSelectedBatch('all');
    setSelectedDept('all');
    setSelectedCity('all');
    setSelectedIndustry('all');
    setSelectedCompany('all');
    setSelectedOpenTo([]);
    setFocusedMapCity(null);
  };

  const toggleOpenTo = (tag: OpenToTag) => {
    setSelectedOpenTo((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatCredentials = (alum: Alumnus) =>
    alum.credentials
      .map((c) => {
        const inst = institutions.find((i) => i.id === c.institutionId);
        return `${inst?.shortName ?? c.institutionId} ’${String(c.batchYear).slice(-2)}`;
      })
      .join(' · ');

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Smart Alumni Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
            Showing {filteredAlumni.length} verified alumni across {cityClusters.length} cities
          </p>
        </div>

        {/* Grid vs City Cluster Map Toggle */}
        <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            City Cluster View
          </button>
        </div>
      </div>

      {/* Multi-Select Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, title, company..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            aria-label="Filter by Graduation Year"
            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="all">All Batches</option>
            {filterOptions.batches.map((b) => (
              <option key={b} value={String(b)}>
                Class of {b}
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            aria-label="Filter by Department"
            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="all">All Departments</option>
            {filterOptions.depts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            aria-label="Filter by City"
            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="all">All Cities</option>
            {filterOptions.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            aria-label="Filter by Industry"
            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="all">All Industries</option>
            {filterOptions.industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Second Row: Company + Open-To Interactive Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Open to:
            </span>
            {OPEN_TO_OPTIONS.map((tag) => {
              const active = selectedOpenTo.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleOpenTo(tag)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                    active
                      ? 'text-white border-transparent'
                      : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 bg-white'
                  }`}
                  style={active ? { backgroundColor: theme.primary } : undefined}
                >
                  {tag}
                </button>
              );
            })}

            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              aria-label="Filter by Company"
              className="h-7 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="all">Any Company</option>
              {filterOptions.companies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="w-3 h-3" />
              Reset ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Results View */}
      {filteredAlumni.length === 0 ? (
        <EmptyState
          title="No alumni match your current filters"
          description="Try broadening your city, graduation year, or Open To criteria to discover more peers."
          actionLabel="Clear All Filters"
          onAction={resetFilters}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAlumni.map((alum) => (
            <div
              key={alum.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenAlumnus(alum)}
                    className="flex items-start gap-3 text-left min-w-0 group"
                  >
                    <AlumniAvatar
                      name={alum.name}
                      initials={alum.initials}
                      tone={alum.avatarTone}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:underline truncate">
                        {alum.name}
                      </h3>
                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {alum.role} · <span className="font-medium text-slate-800">{alum.company}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {formatCredentials(alum)}
                      </p>
                    </div>
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{alum.bio}</p>

                {/* Quiet unboxed metadata line */}
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span>{alum.city}</span>
                  <span aria-hidden="true">·</span>
                  <span>{alum.industry}</span>
                  {alum.openTo.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium" style={{ color: theme.primary }}>
                        {alum.openTo.join(' / ')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAlumnus(alum)}
                  className="text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  View Unified Profile
                </button>
                <button
                  type="button"
                  onClick={() => onToggleConnect(alum.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  style={
                    alum.connected || alum.connectionPending
                      ? { backgroundColor: '#F1F5F9', color: '#334155' }
                      : { backgroundColor: theme.primary, color: '#FFFFFF' }
                  }
                >
                  {alum.connected
                    ? 'Connected'
                    : alum.connectionPending
                    ? 'Pending'
                    : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Interactive City Cluster / Map List View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Interactive Global Hub Schematic */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Global Alumni City Clusters
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a city hub to inspect verified alumni residing there
                </p>
              </div>
              {focusedMapCity && (
                <button
                  type="button"
                  onClick={() => setFocusedMapCity(null)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Show all hubs
                </button>
              )}
            </div>

            <div className="relative w-full aspect-[16/9] rounded-lg bg-slate-900 overflow-hidden border border-slate-800">
              {/* Minimalist Latitude/Longitude Grid */}
              <svg
                viewBox="0 0 100 56"
                className="w-full h-full"
                aria-label="Global alumni distribution map"
              >
                {[14, 28, 42].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="#1E293B"
                    strokeWidth="0.3"
                  />
                ))}
                {[20, 40, 60, 80].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="56"
                    stroke="#1E293B"
                    strokeWidth="0.3"
                  />
                ))}
                {/* Subtle stylized landmass silhouettes */}
                <path
                  d="M8,16 L25,14 L29,24 L21,31 L14,27 Z M39,13 L53,12 L56,22 L44,24 Z M54,23 L72,22 L78,35 L68,45 L58,41 Z M75,37 L87,38 L85,46 L76,45 Z"
                  fill="#1E293B"
                  opacity="0.85"
                />
              </svg>

              {/* Interactive City Cluster Nodes */}
              {cityClusters.map(([city, members]) => {
                const pos = CITY_COORDS[city] ?? { x: 50, y: 50, region: 'Global' };
                const active = focusedMapCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFocusedMapCity(active ? null : city)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-md border transition-transform flex items-center gap-1.5 whitespace-nowrap ${
                        active
                          ? 'scale-110 text-white border-white'
                          : 'bg-white text-slate-900 border-slate-200 hover:scale-105'
                      }`}
                      style={active ? { backgroundColor: theme.primary } : undefined}
                    >
                      <span>{city === 'San Francisco Bay Area' ? 'Bay Area' : city}</span>
                      <span className="font-mono tabular-nums opacity-75">
                        {members.length}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* City Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {cityClusters.slice(0, 4).map(([city, members]) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFocusedMapCity(focusedMapCity === city ? null : city)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    focusedMapCity === city
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                    {members.length}
                  </div>
                  <div className="text-xs font-medium text-slate-700 truncate">{city}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cluster Directory List */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {cityClusters
              .filter(([city]) => !focusedMapCity || city === focusedMapCity)
              .map(([city, members]) => (
                <div key={city} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900">
                      {city}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {members.length} {members.length === 1 ? 'alumnus' : 'alumni'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {members.map((alum) => (
                      <button
                        key={alum.id}
                        type="button"
                        onClick={() => onOpenAlumnus(alum)}
                        className="w-full flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AlumniAvatar
                            name={alum.name}
                            initials={alum.initials}
                            tone={alum.avatarTone}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {alum.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {alum.role} · {alum.company}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">Profile</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
