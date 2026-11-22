import { formatInrCompact } from '../data/mockData';
import { AppState, getActiveTheme } from '../state/store';
import { esc, icon, renderAvatar, renderCrest, renderQrCode } from '../utils/ui';

const BIZ_CATEGORIES = [
  'All',
  'SaaS & AI',
  'FinTech',
  'Consumer & D2C',
  'Advisory & Agencies',
  'HealthTech',
];

const DONATION_PRESETS = [5000, 15000, 50000, 150000];

// ============================================================================
// 6. EVENTS & REUNIONS VIEW
// ============================================================================
export function renderEventsView(state: AppState): string {
  const theme = getActiveTheme(state);
  const visible = state.events.filter((ev) => {
    const wsOk = state.activeWorkspace === 'all' || ev.institutionId === state.activeWorkspace;
    const catOk = state.eventCategory === 'all' || ev.category === state.eventCategory;
    return wsOk && catOk;
  });

  const ticketEvent = state.events.find((e) => e.id === state.ticketEventId) ?? null;

  return `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Events & Milestone Reunions</h1>
          <p class="text-sm text-stone-500 mt-0.5">One-click RSVP with instant QR entry passes and .ics calendar downloads</p>
        </div>
        <div class="inline-flex items-center p-1 rounded-xl bg-stone-200/70 border border-stone-200 self-start sm:self-auto overflow-x-auto max-w-full">
          ${(['all', 'Milestone Reunion', 'City Meetup', 'Virtual Webinar'] as const)
            .map(
              (cat) => `
            <button type="button" data-action="set-event-cat" data-value="${esc(cat)}"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                state.eventCategory === cat
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }">${cat === 'all' ? 'All Events' : esc(cat)}</button>`
            )
            .join('')}
        </div>
      </div>

      ${
        visible.length === 0
          ? `<div class="bg-white border border-stone-200/90 rounded-2xl p-10 text-center">
              <h3 class="text-sm font-semibold text-stone-900">No events match this filter</h3>
              <button type="button" data-action="set-event-cat" data-value="all" class="mt-3 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold">Show All Events</button>
            </div>`
          : `<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              ${visible
                .map((ev) => {
                  const inst = state.institutions.find((i) => i.id === ev.institutionId);
                  const pct = Math.min(100, Math.round((ev.rsvpCount / ev.capacity) * 100));
                  return `
                    <div class="bg-white border border-stone-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4">
                      <div class="space-y-2.5">
                        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                          <span>${esc(ev.category)} · ${esc(inst?.shortName ?? 'Alumni Network')}${
                    ev.milestoneBadge ? ` · ${esc(ev.milestoneBadge)}` : ''
                  }</span>
                          <span class="font-mono font-semibold text-stone-900 tabular-nums">${esc(ev.priceDisplay)}</span>
                        </div>
                        <h3 class="font-editorial text-lg font-semibold text-stone-900 leading-snug">${esc(ev.title)}</h3>
                        <p class="text-xs text-stone-600 leading-relaxed">${esc(ev.description)}</p>
                        <div class="space-y-1.5 pt-1 text-xs text-stone-600">
                          <div class="flex items-center gap-2">${icon('calendar', 'w-3.5 h-3.5 text-stone-400')} <span>${esc(
                    ev.dateDisplay
                  )} · ${esc(ev.timeDisplay)}</span></div>
                          <div class="flex items-center gap-2">${icon(
                            ev.isVirtual ? 'video' : 'mapPin',
                            'w-3.5 h-3.5 text-stone-400'
                          )} <span class="truncate">${esc(ev.location)}</span></div>
                        </div>
                      </div>
                      <div class="pt-3.5 border-t border-stone-100 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <div class="flex -space-x-1.5">
                            ${ev.attendeeInitials
                              .slice(0, 4)
                              .map(
                                (init) =>
                                  `<div class="w-6 h-6 rounded-full bg-stone-800 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">${esc(
                                    init
                                  )}</div>`
                              )
                              .join('')}
                          </div>
                          <div class="text-xs text-stone-600 tabular-nums truncate"><span class="font-semibold text-stone-900">${
                            ev.rsvpCount
                          }</span> / ${ev.capacity} (${pct}%)</div>
                        </div>
                        <button type="button" data-action="rsvp-event" data-id="${esc(ev.id)}"
                          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                          style="${
                            ev.rsvped
                              ? 'background-color:#ECFDF5;color:#065F46;border:1px solid #A7F3D0'
                              : `background-color:${esc(theme.primary)};color:#FFFFFF`
                          }">
                          ${ev.rsvped ? `${icon('ticket', 'w-3.5 h-3.5')} View QR Pass` : 'One-Click RSVP'}
                        </button>
                      </div>
                    </div>`;
                })
                .join('')}
            </div>`
      }

      ${
        ticketEvent
          ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-[2px] p-4" data-action="close-ticket-modal">
              <div class="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden" data-stop-prop="true">
                <div class="flex items-start justify-between px-6 py-4 border-b border-stone-100">
                  <div>
                    <h2 class="text-base font-semibold text-stone-900">Confirmed Event Entry Pass</h2>
                    <p class="text-xs text-stone-500 mt-0.5">Scan at campus check-in or event venue</p>
                  </div>
                  <button type="button" data-action="close-ticket-modal" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                    'x',
                    'w-4 h-4'
                  )}</button>
                </div>
                <div class="p-6 space-y-5">
                  <div class="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                    ${icon('check', 'w-4 h-4')} Registration confirmed for ${esc(state.user.name)}
                  </div>
                  <div class="border border-stone-200 rounded-2xl p-5 flex flex-col items-center text-center space-y-4 bg-stone-50/50">
                    <div>
                      <div class="text-[11px] font-medium text-stone-500">${esc(
                        state.institutions.find((i) => i.id === ticketEvent.institutionId)?.name ??
                          'AlmaOne'
                      )}</div>
                      <h3 class="font-editorial text-base font-semibold text-stone-900 mt-0.5">${esc(
                        ticketEvent.title
                      )}</h3>
                      <p class="text-xs text-stone-600 mt-1">${esc(ticketEvent.dateDisplay)} · ${esc(
              ticketEvent.timeDisplay
            )}</p>
                    </div>
                    ${renderQrCode(`${ticketEvent.passCode ?? ticketEvent.id}-${state.user.id}`, 156)}
                    <div class="w-full pt-3 border-t border-stone-200 grid grid-cols-2 gap-3 text-left text-xs">
                      <div>
                        <div class="text-[11px] text-stone-500">Attendee</div>
                        <div class="font-semibold text-stone-900">${esc(state.user.name)}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-[11px] text-stone-500">Pass ID</div>
                        <div class="font-mono font-semibold text-stone-900 tabular-nums">${esc(
                          ticketEvent.passCode ?? 'ALMA-2026-901'
                        )}</div>
                      </div>
                      <div>
                        <div class="text-[11px] text-stone-500">Ticket Tier</div>
                        <div class="font-medium text-stone-800">Verified Alumnus (${esc(
                          ticketEvent.priceDisplay
                        )})</div>
                      </div>
                      <div class="text-right">
                        <div class="text-[11px] text-stone-500">Venue</div>
                        <div class="font-medium text-stone-800 truncate">${esc(ticketEvent.location)}</div>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" data-action="download-ics" data-id="${esc(ticketEvent.id)}"
                      class="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800">
                      ${icon('download', 'w-3.5 h-3.5')} Add to Calendar (.ics)
                    </button>
                    <button type="button" data-action="close-ticket-modal"
                      class="px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background-color:${esc(
                        theme.primary
                      )}">Done</button>
                  </div>
                </div>
              </div>
            </div>`
          : ''
      }
    </div>
  `;
}

// ============================================================================
// 7. ALUMNI BUSINESS & STARTUP DIRECTORY VIEW
// ============================================================================
export function renderBusinessDirectoryView(state: AppState): string {
  const theme = getActiveTheme(state);
  const q = state.bizQuery.trim().toLowerCase();
  const visible = state.businesses.filter((b) => {
    const wsOk = state.activeWorkspace === 'all' || b.institutionId === state.activeWorkspace;
    const catOk = state.bizCategory === 'All' || b.category === state.bizCategory;
    const qOk =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.tagline.toLowerCase().includes(q) ||
      b.founderName.toLowerCase().includes(q);
    return wsOk && catOk && qOk;
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Alumni Business & Startup Directory</h1>
          <p class="text-sm text-stone-500 mt-0.5">Discover alumni-founded startups, agencies, and verified member-only perks</p>
        </div>
        <button type="button" data-action="open-add-biz"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap self-start sm:self-auto"
          style="background-color:${esc(theme.primary)}">
          ${icon('plus', 'w-3.5 h-3.5')} List Your Venture
        </button>
      </div>

      <div class="bg-white border border-stone-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-1.5">
          ${BIZ_CATEGORIES.map(
            (cat) => `
            <button type="button" data-action="set-biz-cat" data-value="${esc(cat)}"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                state.bizCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }">${esc(cat)}</button>`
          ).join('')}
        </div>
        <div class="relative min-w-[220px]">
          <span class="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">${icon('search', 'w-3.5 h-3.5')}</span>
          <input type="text" data-input="bizQuery" value="${esc(state.bizQuery)}" placeholder="Search startup or founder..."
            class="w-full h-9 pl-8.5 pr-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${visible
          .map((biz) => {
            const founder = state.alumni.find((a) => a.id === biz.founderId);
            const copied = state.copiedBizId === biz.id;
            return `
              <div class="bg-white border border-stone-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4">
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between gap-2 text-xs text-stone-500">
                    <span>${esc(biz.category)} · ${esc(biz.city)}</span>
                    <span class="inline-flex items-center gap-1 font-mono text-[11px] text-stone-500">${esc(
                      biz.website
                    )} ${icon('external', 'w-3 h-3')}</span>
                  </div>
                  <div>
                    <h3 class="font-editorial text-lg font-semibold text-stone-900">${esc(biz.name)}</h3>
                    <p class="text-xs font-medium text-stone-700 mt-0.5">${esc(biz.tagline)}</p>
                  </div>
                  <p class="text-xs text-stone-600 leading-relaxed">${esc(biz.description)}</p>
                  <div class="text-xs text-stone-500">
                    Founded by <button type="button" ${
                      founder ? `data-action="open-profile" data-id="${esc(founder.id)}"` : ''
                    } class="font-semibold text-stone-900 ${founder ? 'hover:underline' : ''}">${esc(
              biz.founderName
            )}</button> (${esc(biz.founderBatch)})
                  </div>
                </div>
                <div class="pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-[11px] font-semibold text-emerald-700">Exclusive Alumni Perk</div>
                    <div class="text-xs text-stone-700 truncate">${esc(biz.discountOffer)}</div>
                  </div>
                  <button type="button" data-action="copy-discount" data-id="${esc(biz.id)}"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 font-mono text-xs font-semibold text-stone-900 shrink-0 transition-colors">
                    ${copied ? `${icon('check', 'w-3.5 h-3.5 text-emerald-600')} Copied` : `${icon('copy', 'w-3.5 h-3.5 text-stone-500')} ${esc(biz.discountCode)}`}
                  </button>
                </div>
              </div>`;
          })
          .join('')}
      </div>

      ${
        state.addBizModalOpen
          ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-[2px] p-4" data-action="close-add-biz">
              <div class="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden" data-stop-prop="true">
                <div class="flex items-start justify-between px-6 py-4 border-b border-stone-100">
                  <div>
                    <h2 class="text-base font-semibold text-stone-900">List Your Business or Startup</h2>
                    <p class="text-xs text-stone-500 mt-0.5">Add your venture with an exclusive alumni discount code.</p>
                  </div>
                  <button type="button" data-action="close-add-biz" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                    'x',
                    'w-4 h-4'
                  )}</button>
                </div>
                <form data-form="add-biz" class="p-6 space-y-3.5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Company Name</label>
                      <input type="text" name="name" required placeholder="e.g., Northstar Cloud" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Category</label>
                      <select name="category" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                        ${BIZ_CATEGORIES.filter((c) => c !== 'All')
                          .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`)
                          .join('')}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-stone-700 mb-1">One-line Tagline</label>
                    <input type="text" name="tagline" required placeholder="What does your business offer?" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs" />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">City</label>
                      <input type="text" name="city" value="Bengaluru" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Website</label>
                      <input type="text" name="website" placeholder="company.com" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-mono" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Campus</label>
                      <select name="institutionId" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                        ${state.institutions
                          .map((i) => `<option value="${esc(i.id)}">${esc(i.shortName)}</option>`)
                          .join('')}
                      </select>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Discount Code</label>
                      <input type="text" name="discountCode" value="ALMA20" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-mono uppercase" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-medium text-stone-700 mb-1">Alumni Perk Details</label>
                      <input type="text" name="discountOffer" value="20% off annual plans for verified alumni" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs" />
                    </div>
                  </div>
                  <div class="flex justify-end gap-2 pt-2">
                    <button type="button" data-action="close-add-biz" class="px-4 py-2 text-xs font-medium text-stone-600">Cancel</button>
                    <button type="submit" class="px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background-color:${esc(
                      theme.primary
                    )}">Add to Directory</button>
                  </div>
                </form>
              </div>
            </div>`
          : ''
      }
    </div>
  `;
}

// ============================================================================
// 8. GIVING & FUNDRAISING CAMPAIGNS VIEW
// ============================================================================
export function renderGivingView(state: AppState): string {
  const theme = getActiveTheme(state);
  const visibleCampaigns = state.campaigns.filter(
    (c) => state.activeWorkspace === 'all' || c.institutionId === state.activeWorkspace
  );
  const visibleBoard = state.leaderboard
    .filter((e) => state.activeWorkspace === 'all' || e.institutionId === state.activeWorkspace)
    .sort((a, b) => b.participationPct - a.participationPct);

  const totalRaised = visibleCampaigns.reduce((s, c) => s + c.raisedAmountInr, 0);
  const totalDonors = visibleCampaigns.reduce((s, c) => s + c.donorCount, 0);
  const donateCampaign = state.campaigns.find((c) => c.id === state.donateCampaignId) ?? null;

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Giving & Endowment Campaigns</h1>
          <p class="text-sm text-stone-500 mt-0.5">Direct transparent funding for student scholarships, fellowships, and campus heritage</p>
        </div>
        <div class="flex items-center gap-6 text-right">
          <div>
            <div class="text-lg font-bold font-mono text-stone-900 tabular-nums">${esc(formatInrCompact(totalRaised))}</div>
            <div class="text-[11px] text-stone-500">Total Raised (FY26)</div>
          </div>
          <div class="h-8 w-px bg-stone-200"></div>
          <div>
            <div class="text-lg font-bold font-mono text-stone-900 tabular-nums">${totalDonors.toLocaleString('en-IN')}</div>
            <div class="text-[11px] text-stone-500">Verified Donors</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        ${visibleCampaigns
          .map((camp) => {
            const inst = state.institutions.find((i) => i.id === camp.institutionId);
            const pct = Math.min(100, Math.round((camp.raisedAmountInr / camp.goalAmountInr) * 100));
            return `
              <div class="bg-white border border-stone-200/90 rounded-2xl p-5 flex flex-col justify-between gap-5">
                <div class="space-y-2.5">
                  <div class="text-xs text-stone-500">${esc(inst?.shortName ?? 'Campus')} · ${esc(
              camp.category
            )} · <span class="tabular-nums">${camp.daysLeft} days left</span></div>
                  <h3 class="font-editorial text-lg font-semibold text-stone-900 leading-snug">${esc(camp.title)}</h3>
                  <p class="text-xs text-stone-600 leading-relaxed">${esc(camp.summary)}</p>
                </div>
                <div class="space-y-3">
                  <div class="space-y-1.5">
                    <div class="flex items-baseline justify-between text-xs font-mono tabular-nums">
                      <span class="font-bold text-stone-900">${esc(formatInrCompact(camp.raisedAmountInr))}</span>
                      <span class="text-stone-500">${pct}% of ${esc(formatInrCompact(camp.goalAmountInr))}</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-300" style="width:${pct}%;background-color:${esc(
              inst?.theme.primary ?? theme.primary
            )}"></div>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-stone-500 tabular-nums">
                      <span>${camp.donorCount} donors</span>
                      <span class="truncate ml-2">${esc(camp.impactNote)}</span>
                    </div>
                  </div>
                  <button type="button" data-action="open-donate" data-id="${esc(camp.id)}"
                    class="w-full py-2 rounded-lg text-xs font-semibold text-white"
                    style="background-color:${esc(inst?.theme.primary ?? theme.primary)}">Contribute to Fund</button>
                </div>
              </div>`;
          })
          .join('')}
      </div>

      <!-- Batch-Wise Giving Leaderboard -->
      <div class="bg-white border border-stone-200/90 rounded-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold text-stone-900 flex items-center gap-2">${icon(
              'award',
              'w-4 h-4 text-amber-600'
            )} Batch-Wise Giving Leaderboard</h2>
            <p class="text-xs text-stone-500 mt-0.5">Ranked by verified cohort participation rate</p>
          </div>
          <span class="text-xs text-stone-500">80G Tax Exempt</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-stone-100 text-[11px] font-semibold text-stone-500 bg-stone-50/70">
                <th class="py-3 px-6">Rank</th>
                <th class="py-3 px-4">Batch</th>
                <th class="py-3 px-4">Institution</th>
                <th class="py-3 px-4">Participation</th>
                <th class="py-3 px-4 text-right">Donors</th>
                <th class="py-3 px-6 text-right">Total Raised</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-xs">
              ${visibleBoard
                .map((entry, idx) => {
                  const inst = state.institutions.find((i) => i.id === entry.institutionId);
                  const isUserBatch = inst?.userCredential.batchYear === entry.batchYear;
                  return `
                    <tr class="hover:bg-stone-50/70 ${isUserBatch ? 'bg-stone-50/50' : ''}">
                      <td class="py-3.5 px-6 font-mono font-semibold text-stone-700 tabular-nums">#${idx + 1}</td>
                      <td class="py-3.5 px-4 font-semibold text-stone-900">Class of ${entry.batchYear}${
                    isUserBatch ? ' <span class="font-normal text-stone-500">(Your Batch)</span>' : ''
                  }</td>
                      <td class="py-3.5 px-4 text-stone-600">${esc(inst?.name ?? entry.institutionId)}</td>
                      <td class="py-3.5 px-4">
                        <div class="flex items-center gap-3">
                          <div class="w-28 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                            <div class="h-full rounded-full" style="width:${Math.min(
                              100,
                              entry.participationPct
                            )}%;background-color:${esc(inst?.theme.primary ?? theme.primary)}"></div>
                          </div>
                          <span class="font-mono font-semibold text-stone-800 tabular-nums">${entry.participationPct.toFixed(
                            1
                          )}%</span>
                        </div>
                      </td>
                      <td class="py-3.5 px-4 text-right font-mono text-stone-700 tabular-nums">${entry.donorsCount}</td>
                      <td class="py-3.5 px-6 text-right font-mono font-semibold text-stone-900 tabular-nums">${esc(
                        formatInrCompact(entry.totalRaisedInr)
                      )}</td>
                    </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${
        donateCampaign
          ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-[2px] p-4" data-action="close-donate">
              <div class="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden" data-stop-prop="true">
                <div class="flex items-start justify-between px-6 py-4 border-b border-stone-100">
                  <div>
                    <h2 class="text-base font-semibold text-stone-900">${
                      state.donateReceipt ? 'Contribution Confirmed' : 'Make an Alumni Contribution'
                    }</h2>
                    <p class="text-xs text-stone-500 mt-0.5">${esc(donateCampaign.title)}</p>
                  </div>
                  <button type="button" data-action="close-donate" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                    'x',
                    'w-4 h-4'
                  )}</button>
                </div>
                <div class="p-6">
                  ${
                    state.donateReceipt
                      ? `<div class="text-center py-4 space-y-3">
                          <div class="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">${icon(
                            'check',
                            'w-5 h-5'
                          )}</div>
                          <h3 class="font-editorial text-lg font-semibold text-stone-900">Thank you for contributing ₹${state.donateAmount.toLocaleString(
                            'en-IN'
                          )}</h3>
                          <p class="text-xs text-stone-600 max-w-sm mx-auto">Your gift has been credited to your batch leaderboard. 80G Tax Receipt ID: <span class="font-mono font-semibold">${esc(
                            state.donateReceipt
                          )}</span></p>
                          <button type="button" data-action="close-donate" class="mt-2 px-5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold">Return to Campaigns</button>
                        </div>`
                      : `<form data-form="donate" data-campaign-id="${esc(donateCampaign.id)}" class="space-y-4">
                          <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">${esc(
                            donateCampaign.impactNote
                          )}</div>
                          <div>
                            <label class="block text-xs font-semibold text-stone-700 mb-2">Choose Contribution Amount (INR)</label>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              ${DONATION_PRESETS.map(
                                (val) => `
                                <button type="button" data-action="set-donate-amt" data-value="${val}"
                                  class="py-2.5 rounded-lg border font-mono text-xs font-semibold tabular-nums ${
                                    state.donateAmount === val
                                      ? 'border-stone-900 bg-stone-900 text-white'
                                      : 'border-stone-200 text-stone-800 hover:border-stone-300'
                                  }">₹${val.toLocaleString('en-IN')}</button>`
                              ).join('')}
                            </div>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-stone-700 mb-1">Custom Amount (₹)</label>
                            <input type="number" name="amount" min="500" step="500" value="${state.donateAmount}"
                              class="w-full h-9 px-3 rounded-lg border border-stone-200 font-mono text-sm tabular-nums" />
                          </div>
                          <label class="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                            <input type="checkbox" name="anonymous" ${
                              state.donateAnonymous ? 'checked' : ''
                            } class="rounded border-stone-300" />
                            Keep my name anonymous on the public donor wall
                          </label>
                          <div class="flex justify-end gap-2 pt-2">
                            <button type="button" data-action="close-donate" class="px-4 py-2 text-xs font-medium text-stone-600">Cancel</button>
                            <button type="submit" class="px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background-color:${esc(
                              theme.primary
                            )}">Complete Contribution</button>
                          </div>
                        </form>`
                  }
                </div>
              </div>
            </div>`
          : ''
      }
    </div>
  `;
}

// ============================================================================
// 9. DIGITAL ALUMNI ID CARD VIEW
// ============================================================================
export function renderDigitalIdView(state: AppState): string {
  const selectedInst =
    state.institutions.find((i) => i.id === state.idCardInstId) ?? state.institutions[0];
  if (!selectedInst) return '';

  const privacyItems: Array<{
    key: keyof AppState['user']['privacy'];
    title: string;
    desc: string;
  }> = [
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
  ];

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Digital Alumni ID Card</h1>
          <p class="text-sm text-stone-500 mt-0.5">Interactive campus gate, library, and reunion credential synced across your verified institutions</p>
        </div>
        <div class="inline-flex items-center p-1 rounded-xl bg-stone-200/70 border border-stone-200 self-start sm:self-auto flex-wrap">
          ${state.institutions
            .map(
              (inst) => `
            <button type="button" data-action="set-id-inst" data-value="${esc(inst.id)}"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedInst.id === inst.id ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }">${esc(inst.shortName)}</button>`
            )
            .join('')}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center space-y-5">
          <div class="w-full max-w-[448px] perspective-1200">
            <div data-action="flip-id-card" role="button" tabindex="0" aria-label="Flip Digital Alumni ID Card"
              class="relative w-full aspect-[1.58/1] min-h-[272px] cursor-pointer preserve-3d transition-transform duration-500 ${
                state.idCardFlipped ? 'rotate-y-180' : ''
              }">
              <!-- FRONT -->
              <div class="absolute inset-0 backface-hidden rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between overflow-hidden"
                style="background:linear-gradient(135deg,${esc(selectedInst.theme.gradientFrom)} 0%,${esc(
    selectedInst.theme.gradientTo
  )} 100%)">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                      ${renderCrest(selectedInst.crestVariant, '#FFFFFF', 22)}
                    </div>
                    <div class="min-w-0">
                      <div class="font-editorial text-base font-semibold tracking-tight truncate">${esc(
                        selectedInst.name
                      )}</div>
                      <div class="text-[11px] text-white/75 truncate">Official Verified Alumni Credential</div>
                    </div>
                  </div>
                  <div class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200 shrink-0">
                    ${icon('check', 'w-3.5 h-3.5')} Verified
                  </div>
                </div>

                <div class="flex items-center gap-4 my-2">
                  ${renderAvatar({
                    name: state.user.name,
                    initials: 'RS',
                    avatarUrl: state.user.avatarUrl,
                    size: 'xl',
                    extraClass: 'border-2 border-white/30',
                  })}
                  <div class="min-w-0 space-y-0.5">
                    <div class="font-editorial text-xl font-semibold tracking-tight truncate">${esc(
                      state.user.name
                    )}</div>
                    <div class="text-xs text-white/90 truncate">${esc(selectedInst.userCredential.degree)}</div>
                    <div class="text-[11px] text-white/75 truncate">${esc(
                      selectedInst.userCredential.department
                    )}</div>
                    ${
                      state.user.privacy.showCompany
                        ? `<div class="text-[11px] text-white/85 truncate pt-0.5">${esc(state.user.role)} · ${esc(
                            state.user.company
                          )}</div>`
                        : ''
                    }
                  </div>
                </div>

                <div class="pt-3 border-t border-white/20 flex items-end justify-between gap-3">
                  <div>
                    <div class="text-[10px] text-white/65">Roll / Alumni No.</div>
                    <div class="font-mono text-xs font-semibold tabular-nums">${esc(
                      selectedInst.userCredential.rollNumber
                    )}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-[10px] text-white/65">Class Of</div>
                    <div class="font-mono text-xs font-semibold tabular-nums">${
                      selectedInst.userCredential.batchYear
                    }</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] text-white/65">Campus Access</div>
                    <div class="font-mono text-xs font-semibold tabular-nums">${esc(
                      selectedInst.userCredential.campusAccessCode
                    )}</div>
                  </div>
                </div>
              </div>

              <!-- BACK -->
              <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6 bg-white border border-stone-300 shadow-lg flex flex-col justify-between text-stone-900">
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-1.5 flex-1 min-w-0">
                    <div class="text-xs font-bold text-stone-900">Campus Gate & Library Entry Pass</div>
                    <p class="text-[11px] text-stone-500 leading-relaxed">Scan at ${esc(
                      selectedInst.shortName
                    )} main gates, central library, or Alumni Guest House.</p>
                    <div class="pt-2 space-y-1 text-[11px]">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-stone-500">Email:</span>
                        <span class="font-mono text-stone-800 truncate">${esc(
                          state.user.privacy.showEmail ? state.user.email : 'Hidden by privacy'
                        )}</span>
                      </div>
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-stone-500">Phone:</span>
                        <span class="font-mono text-stone-800 tabular-nums">${esc(
                          state.user.privacy.showPhone ? state.user.phone : 'Hidden by privacy'
                        )}</span>
                      </div>
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-stone-500">Employer:</span>
                        <span class="text-stone-800 truncate">${esc(
                          state.user.privacy.showCompany ? state.user.company : 'Hidden by privacy'
                        )}</span>
                      </div>
                    </div>
                  </div>
                  <div class="shrink-0 flex flex-col items-center gap-1">
                    ${renderQrCode(
                      `ALMAONE:${selectedInst.id}:${selectedInst.userCredential.rollNumber}:${state.user.id}`,
                      112,
                      selectedInst.theme.primary
                    )}
                    <span class="font-mono text-[10px] text-stone-400 tabular-nums">${esc(
                      selectedInst.userCredential.campusAccessCode
                    )}</span>
                  </div>
                </div>
                <div class="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Verified via ${esc(selectedInst.userCredential.verificationMethod)}</span>
                  <span class="font-mono tabular-nums">Since ${esc(
                    selectedInst.userCredential.verifiedSince
                  )}</span>
                </div>
              </div>
            </div>
          </div>

          <button type="button" data-action="flip-id-card"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors">
            ${icon('rotate', 'w-3.5 h-3.5')} ${
    state.idCardFlipped ? 'Show Front of ID Card' : 'Flip for Campus QR Pass'
  }
          </button>
        </div>

        <div class="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 space-y-5">
          <div>
            <h2 class="text-sm font-semibold text-stone-900 flex items-center gap-1.5">${icon(
              'lock',
              'w-4 h-4 text-stone-500'
            )} Granular Privacy Controls</h2>
            <p class="text-xs text-stone-500 mt-0.5">Live toggles update your Digital ID and directory profile immediately.</p>
          </div>
          <div class="divide-y divide-stone-100">
            ${privacyItems
              .map((item) => {
                const enabled = state.user.privacy[item.key];
                return `
                  <div class="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div class="min-w-0">
                      <div class="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                        ${icon(
                          enabled ? 'eye' : 'eyeOff',
                          `w-3.5 h-3.5 ${enabled ? 'text-emerald-600' : 'text-stone-400'}`
                        )}
                        ${esc(item.title)}
                      </div>
                      <p class="text-[11px] text-stone-500 mt-0.5">${esc(item.desc)}</p>
                    </div>
                    <button type="button" role="switch" aria-checked="${enabled}" data-action="toggle-privacy" data-key="${item.key}"
                      class="w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                        enabled ? 'bg-stone-900 justify-end' : 'bg-stone-200 justify-start'
                      }">
                      <span class="w-4.5 h-4.5 rounded-full bg-white shadow-xs block"></span>
                    </button>
                  </div>`;
              })
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 10. INSTITUTIONAL ADMIN PORTAL (B2B VIEW)
// ============================================================================
export function renderAdminPortalView(state: AppState): string {
  const activeInst =
    state.institutions.find((i) => i.id === state.adminInstId) ?? state.institutions[0];
  if (!activeInst) return '';

  const scopedRequests = state.verificationRequests.filter(
    (r) =>
      r.institutionId === activeInst.id &&
      (state.adminStatusFilter === 'all' || r.status === 'pending')
  );
  const pendingCount = state.verificationRequests.filter(
    (r) => r.institutionId === activeInst.id && r.status === 'pending'
  ).length;

  let estReach = activeInst.verifiedCount;
  if (state.bcBatch !== 'All Batches') estReach = Math.round(estReach * 0.28);
  if (state.bcDept !== 'All Departments') estReach = Math.round(estReach * 0.34);
  if (state.bcCity !== 'All Cities') estReach = Math.round(estReach * 0.24);
  estReach = Math.max(48, estReach);

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

  const instBroadcasts = state.broadcasts.filter((b) => b.institutionId === activeInst.id);

  return `
    <div class="space-y-6">
      <div class="bg-stone-900 text-white rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-stone-300">${icon(
            'shield',
            'w-4 h-4 text-emerald-400'
          )} <span>Institutional Admin Portal (B2B View)</span></div>
          <h1 class="font-editorial text-2xl font-semibold tracking-tight">${esc(
            activeInst.name
          )} — Alumni Office Console</h1>
          <p class="text-xs text-stone-300">Audit alumni verification claims, monitor cohort activation, and dispatch segmented campus broadcasts.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-stone-300">Campus:</label>
          <select data-select="adminInstId" class="h-9 px-3 rounded-lg bg-stone-800 border border-stone-700 text-xs font-semibold text-white">
            ${state.institutions
              .map(
                (i) =>
                  `<option value="${esc(i.id)}" ${activeInst.id === i.id ? 'selected' : ''}>${esc(
                    i.name
                  )}</option>`
              )
              .join('')}
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3">
        ${(
          [
            { id: 'queue', label: `Verification Queue (${pendingCount})`, ic: 'userCheck' as const },
            { id: 'analytics', label: 'Engagement Analytics', ic: 'chart' as const },
            { id: 'broadcast', label: 'Broadcast Center', ic: 'megaphone' as const },
          ] as const
        )
          .map(
            (tab) => `
          <button type="button" data-action="set-admin-tab" data-value="${tab.id}"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              state.adminTab === tab.id
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }">${icon(tab.ic, 'w-3.5 h-3.5')} ${tab.label}</button>`
          )
          .join('')}
      </div>

      ${
        state.adminTab === 'queue'
          ? `<div class="space-y-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h2 class="text-sm font-semibold text-stone-900">Alumni Identity Verification Queue</h2>
                  <p class="text-xs text-stone-500">Cross-checked against Registrar Roll Number records and peer vouches</p>
                </div>
                <div class="inline-flex items-center p-0.5 bg-stone-200/70 rounded-lg border border-stone-200">
                  <button type="button" data-action="set-admin-filter" data-value="pending" class="px-2.5 py-1 rounded-md text-xs font-semibold ${
                    state.adminStatusFilter === 'pending' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }">Pending (${pendingCount})</button>
                  <button type="button" data-action="set-admin-filter" data-value="all" class="px-2.5 py-1 rounded-md text-xs font-semibold ${
                    state.adminStatusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }">All Requests</button>
                </div>
              </div>

              ${
                scopedRequests.length === 0
                  ? `<div class="bg-white border border-stone-200/90 rounded-2xl p-10 text-center">
                      <h3 class="text-sm font-semibold text-stone-900">Verification queue is clear</h3>
                      <p class="text-xs text-stone-500 mt-1">All pending alumni requests for ${esc(
                        activeInst.name
                      )} have been processed.</p>
                    </div>`
                  : `<div class="bg-white border border-stone-200/90 rounded-2xl overflow-hidden">
                      <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                          <thead>
                            <tr class="border-b border-stone-100 bg-stone-50/70 text-[11px] font-semibold text-stone-500">
                              <th class="py-3 px-5">Applicant</th>
                              <th class="py-3 px-4">Claimed Program & Batch</th>
                              <th class="py-3 px-4">Roll No. Match</th>
                              <th class="py-3 px-4">Peer Vouches</th>
                              <th class="py-3 px-4">Status</th>
                              <th class="py-3 px-5 text-right">Decision</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-stone-100 text-xs">
                            ${scopedRequests
                              .map(
                                (req) => `
                              <tr class="hover:bg-stone-50/60">
                                <td class="py-3.5 px-5">
                                  <div class="font-semibold text-stone-900">${esc(req.applicantName)}</div>
                                  <div class="text-[11px] font-mono text-stone-500">${esc(req.email)}</div>
                                </td>
                                <td class="py-3.5 px-4">
                                  <div class="text-stone-800 font-medium">${esc(req.claimedDegree)} · ${
                                  req.claimedBatch
                                }</div>
                                  <div class="text-[11px] text-stone-500">${esc(req.claimedDepartment)}</div>
                                </td>
                                <td class="py-3.5 px-4">
                                  <div class="font-mono font-semibold text-stone-800 tabular-nums">${esc(
                                    req.rollNumber
                                  )}</div>
                                  <div class="text-[11px] font-semibold ${
                                    req.rollMatchStatus === 'Exact Match'
                                      ? 'text-emerald-700'
                                      : req.rollMatchStatus === 'Partial Match'
                                      ? 'text-amber-700'
                                      : 'text-rose-700'
                                  }">${esc(req.rollMatchStatus)}</div>
                                </td>
                                <td class="py-3.5 px-4">
                                  <div class="font-mono font-semibold text-stone-800 tabular-nums">${
                                    req.peerVouches
                                  } / 2 vouches</div>
                                  <div class="text-[11px] text-stone-500 truncate max-w-[170px]">${esc(
                                    req.peerVouchNames.join(', ') || 'None yet'
                                  )}</div>
                                </td>
                                <td class="py-3.5 px-4">
                                  <span class="font-semibold capitalize ${
                                    req.status === 'approved'
                                      ? 'text-emerald-700'
                                      : req.status === 'rejected'
                                      ? 'text-rose-700'
                                      : 'text-amber-700'
                                  }">${req.status}</span>
                                  <div class="text-[11px] text-stone-400 tabular-nums">${esc(req.submittedAt)}</div>
                                </td>
                                <td class="py-3.5 px-5 text-right">
                                  ${
                                    req.status === 'pending'
                                      ? `<div class="inline-flex items-center gap-1.5">
                                          <button type="button" data-action="approve-verif" data-id="${esc(req.id)}"
                                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap">${icon(
                                              'check',
                                              'w-3.5 h-3.5'
                                            )} Approve</button>
                                          <button type="button" data-action="reject-verif" data-id="${esc(req.id)}"
                                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 hover:text-rose-700 text-stone-700 text-xs font-semibold whitespace-nowrap">${icon(
                                              'x',
                                              'w-3.5 h-3.5'
                                            )} Reject</button>
                                        </div>`
                                      : `<span class="text-[11px] text-stone-400">Processed</span>`
                                  }
                                </td>
                              </tr>`
                              )
                              .join('')}
                          </tbody>
                        </table>
                      </div>
                    </div>`
              }
            </div>`
          : state.adminTab === 'analytics'
          ? `<div class="space-y-5">
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white border border-stone-200/90 rounded-2xl p-5">
                  <div class="text-xs text-stone-500">Verified Alumni</div>
                  <div class="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">${activeInst.verifiedCount.toLocaleString(
                    'en-IN'
                  )}</div>
                  <div class="text-[11px] text-emerald-700 font-semibold mt-1">+4.8% last 30 days</div>
                </div>
                <div class="bg-white border border-stone-200/90 rounded-2xl p-5">
                  <div class="text-xs text-stone-500">Batch Activation</div>
                  <div class="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">${
                    activeInst.activeBatchRate
                  }%</div>
                  <div class="text-[11px] text-stone-500 mt-1">Active verified cohorts</div>
                </div>
                <div class="bg-white border border-stone-200/90 rounded-2xl p-5">
                  <div class="text-xs text-stone-500">Mentorship Sessions</div>
                  <div class="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">${Math.round(
                    activeInst.verifiedCount * 0.085
                  ).toLocaleString('en-IN')}</div>
                  <div class="text-[11px] text-emerald-700 font-semibold mt-1">94% completion rate</div>
                </div>
                <div class="bg-white border border-stone-200/90 rounded-2xl p-5">
                  <div class="text-xs text-stone-500">Referrals Placed</div>
                  <div class="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">${Math.round(
                    activeInst.verifiedCount * 0.032
                  ).toLocaleString('en-IN')}</div>
                  <div class="text-[11px] text-stone-500 mt-1">140+ hiring partners</div>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div class="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
                  <div>
                    <h3 class="text-sm font-semibold text-stone-900">Batch Activation Rates (%)</h3>
                    <p class="text-xs text-stone-500 mt-0.5">Cohort verification & quarterly activity</p>
                  </div>
                  <div class="flex items-end justify-between gap-3 h-48 pt-4 px-2 border-b border-stone-100">
                    ${batchActivation
                      .map(
                        (b) => `
                      <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span class="text-[11px] font-mono font-semibold text-stone-700 tabular-nums">${b.pct}%</span>
                        <div class="w-full max-w-[38px] rounded-t-md" style="height:${b.pct}%;background-color:${esc(
                          activeInst.theme.primary
                        )}"></div>
                        <span class="text-[11px] font-mono text-stone-500 tabular-nums pb-1">’${b.year.slice(-2)}</span>
                      </div>`
                      )
                      .join('')}
                  </div>
                </div>
                <div class="lg:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
                  <div>
                    <h3 class="text-sm font-semibold text-stone-900">Top Alumni Cities</h3>
                    <p class="text-xs text-stone-500 mt-0.5">Geographic density of graduates</p>
                  </div>
                  <div class="space-y-3.5">
                    ${topCities
                      .map((c) => {
                        const pct = Math.round((c.count / activeInst.verifiedCount) * 100);
                        return `
                          <div class="space-y-1">
                            <div class="flex items-center justify-between text-xs">
                              <span class="font-medium text-stone-800">${esc(c.city)}</span>
                              <span class="font-mono text-stone-600 tabular-nums">${c.count.toLocaleString(
                                'en-IN'
                              )} (${pct}%)</span>
                            </div>
                            <div class="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                              <div class="h-full rounded-full" style="width:${Math.min(
                                100,
                                pct * 2.5
                              )}%;background-color:${esc(activeInst.theme.primary)}"></div>
                            </div>
                          </div>`;
                      })
                      .join('')}
                  </div>
                </div>
                <div class="lg:col-span-3 bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
                  <div>
                    <h3 class="text-sm font-semibold text-stone-900">Top Employers</h3>
                    <p class="text-xs text-stone-500 mt-0.5">Highest alumni presence</p>
                  </div>
                  <div class="divide-y divide-stone-100">
                    ${topEmployers
                      .map(
                        (e, i) => `
                      <div class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <span class="text-stone-800 font-medium"><span class="font-mono text-stone-400 mr-2 tabular-nums">0${
                          i + 1
                        }</span>${esc(e.company)}</span>
                        <span class="font-mono font-semibold text-stone-900 tabular-nums">${e.count}</span>
                      </div>`
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            </div>`
          : `<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form data-form="send-broadcast" class="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4">
                <div>
                  <h2 class="text-sm font-semibold text-stone-900">Compose Segmented Campus Broadcast</h2>
                  <p class="text-xs text-stone-500 mt-0.5">Published notices appear immediately in the target campus Home Feed.</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-stone-700 mb-1">Target Batch</label>
                    <select data-select="bcBatch" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                      ${['All Batches', '2010 – 2015', '2016 – 2020', '2021 – 2025']
                        .map((o) => `<option value="${esc(o)}" ${state.bcBatch === o ? 'selected' : ''}>${esc(o)}</option>`)
                        .join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-stone-700 mb-1">Department</label>
                    <select data-select="bcDept" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                      ${['All Departments', 'Computer Science & Engineering', 'Strategy & Product Leadership', 'Science & Mathematics']
                        .map((o) => `<option value="${esc(o)}" ${state.bcDept === o ? 'selected' : ''}>${esc(o)}</option>`)
                        .join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-stone-700 mb-1">City / Chapter</label>
                    <select data-select="bcCity" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                      ${['All Cities', 'Bengaluru', 'Hyderabad', 'Mumbai', 'San Francisco Bay Area']
                        .map((o) => `<option value="${esc(o)}" ${state.bcCity === o ? 'selected' : ''}>${esc(o)}</option>`)
                        .join('')}
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-stone-700 mb-1">Announcement Subject</label>
                  <input type="text" data-input="bcTitle" value="${esc(state.bcTitle)}" required
                    placeholder="e.g., Call for Annual Alumni Mentorship Cohort"
                    class="w-full h-9.5 px-3 rounded-lg border border-stone-200 text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-stone-700 mb-1">Message Body</label>
                  <textarea data-input="bcBody" rows="4" required placeholder="Write official institutional update..."
                    class="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm resize-none">${esc(
                      state.bcBody
                    )}</textarea>
                </div>
                <div class="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div class="text-xs text-stone-600">Estimated Reach: <span class="font-mono font-bold text-stone-900 tabular-nums">${estReach.toLocaleString(
                    'en-IN'
                  )} verified alumni</span></div>
                  <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                    style="background-color:${esc(activeInst.theme.primary)}">${icon('send', 'w-3.5 h-3.5')} Publish Broadcast to Feed</button>
                </div>
              </form>

              <div class="lg:col-span-5 space-y-4">
                <div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-3">
                  <div class="text-xs font-semibold text-stone-500">Live Member Feed Preview</div>
                  <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div class="text-[11px] font-semibold" style="color:${esc(activeInst.theme.primary)}">Campus Broadcast · ${esc(
              state.bcBatch
            )} · ${esc(state.bcCity)}</div>
                    <div class="font-editorial text-base font-semibold text-stone-900">${esc(
                      state.bcTitle.trim() || 'Your announcement subject will appear here'
                    )}</div>
                    <p class="text-xs text-stone-600 leading-relaxed">${esc(
                      state.bcBody.trim() ||
                        'Compose an official campus message on the left to preview how verified alumni see it.'
                    )}</p>
                    <div class="text-[11px] text-stone-400 pt-1">${esc(activeInst.name)} Alumni Office · Just now</div>
                  </div>
                </div>

                <div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-3">
                  <h3 class="text-xs font-semibold text-stone-900">Recent Broadcasts (${instBroadcasts.length})</h3>
                  ${
                    instBroadcasts.length === 0
                      ? `<p class="text-xs text-stone-500">No broadcasts sent for this campus yet.</p>`
                      : `<div class="divide-y divide-stone-100">
                          ${instBroadcasts
                            .map(
                              (bc) => `
                            <div class="py-3 first:pt-0 last:pb-0 space-y-1">
                              <div class="text-xs font-semibold text-stone-900">${esc(bc.title)}</div>
                              <div class="text-[11px] text-stone-500 tabular-nums">${esc(bc.targetBatch)} · ${esc(
                                bc.targetCity
                              )} · ${bc.estimatedReach.toLocaleString('en-IN')} reached · ${esc(bc.sentAt)}</div>
                            </div>`
                            )
                            .join('')}
                        </div>`
                  }
                </div>
              </div>
            </div>`
      }
    </div>
  `;
}
