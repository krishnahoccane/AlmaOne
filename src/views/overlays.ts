import { AppState, getActiveInstitution, getActiveTheme } from '../state/store';
import { NavSection } from '../types/alumni';
import { esc, icon, IconName, renderAvatar, renderCrest } from '../utils/ui';

const MEMBER_NAV: { id: NavSection; label: string; ic: IconName }[] = [
  { id: 'feed', label: 'Home Feed', ic: 'home' },
  { id: 'directory', label: 'Alumni Directory', ic: 'users' },
  { id: 'groups', label: 'Chapters & Groups', ic: 'layers' },
  { id: 'jobs', label: 'Jobs & Referrals', ic: 'briefcase' },
  { id: 'mentorship', label: 'Mentorship Hub', ic: 'grad' },
  { id: 'events', label: 'Events & Reunions', ic: 'calendar' },
  { id: 'businesses', label: 'Business Directory', ic: 'store' },
  { id: 'giving', label: 'Giving & Campaigns', ic: 'heart' },
  { id: 'id-card', label: 'Digital Alumni ID', ic: 'card' },
];

const CAMPUS_PRESETS = [
  { name: 'IIT Bombay', type: 'Engineering Institute', location: 'Mumbai, Maharashtra', domain: 'iitb.ac.in' },
  { name: 'DPS R.K. Puram', type: 'High School', location: 'New Delhi', domain: 'dpsrkp.net' },
  { name: 'Stanford University', type: 'University', location: 'Stanford, CA', domain: 'stanford.edu' },
  { name: 'IIM Ahmedabad', type: 'Business School', location: 'Ahmedabad, Gujarat', domain: 'iima.ac.in' },
];

export function renderSidebar(state: AppState): string {
  const activeInst = getActiveInstitution(state);
  const theme = getActiveTheme(state);
  const pendingAdmin = state.verificationRequests.filter(
    (r) =>
      r.status === 'pending' &&
      (state.activeWorkspace === 'all' || r.institutionId === state.activeWorkspace)
  ).length;

  const inner = `
    <div class="flex flex-col h-full bg-white border-r border-stone-200/90 select-none">
      <div class="h-16 px-5 flex items-center justify-between border-b border-stone-100 shrink-0">
        <button type="button" data-action="nav" data-section="feed" class="flex items-center gap-2.5 text-left">
          ${renderCrest(activeInst ? activeInst.crestVariant : 'unified', theme.primary, 26)}
          <span class="font-editorial font-semibold text-lg tracking-tight text-stone-900 whitespace-nowrap">AlmaOne</span>
        </button>
        <button type="button" data-action="close-mobile-menu" class="lg:hidden p-1.5 rounded-lg text-stone-400 hover:bg-stone-100" aria-label="Close navigation">
          ${icon('x', 'w-4 h-4')}
        </button>
      </div>

      <div class="px-4 py-3.5 border-b border-stone-100">
        <div class="flex items-center justify-between text-xs text-stone-500">
          <span class="truncate font-semibold text-stone-800">${esc(
            state.activeWorkspace === 'all'
              ? `All Alma Maters (${state.institutions.length})`
              : activeInst?.shortName ?? ''
          )}</span>
          <span class="font-mono text-[11px] tabular-nums shrink-0 text-stone-400">${esc(
            state.activeWorkspace === 'all'
              ? 'Unified'
              : `’${String(activeInst?.userCredential.batchYear ?? '').slice(-2)}`
          )}</span>
        </div>
        <p class="text-[11px] text-stone-500 mt-0.5 truncate">${esc(
          state.activeWorkspace === 'all'
            ? '1 Verified Identity · Laravel + Tailwind'
            : activeInst?.userCredential.degree ?? ''
        )}</p>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Primary Navigation">
        ${MEMBER_NAV.map((item) => {
          const active = state.activeSection === item.id;
          return `
            <button type="button" data-action="nav" data-section="${item.id}"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors whitespace-nowrap text-left ${
                active ? 'font-semibold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }" ${
            active
              ? `style="background-color:${esc(theme.softBg)};color:${esc(theme.primary)}"`
              : ''
          }>
              ${icon(item.ic, 'w-4 h-4')}
              <span class="truncate">${item.label}</span>
            </button>`;
        }).join('')}

        <div class="pt-3 mt-3 border-t border-stone-100">
          <button type="button" data-action="nav" data-section="admin"
            class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors whitespace-nowrap ${
              state.activeSection === 'admin'
                ? 'bg-stone-900 text-white'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
            }">
            <span class="flex items-center gap-2.5 min-w-0">
              ${icon('shield', 'w-4 h-4')}
              <span class="truncate">Admin Portal</span>
            </span>
            ${
              pendingAdmin > 0
                ? `<span class="text-[11px] font-mono tabular-nums ${
                    state.activeSection === 'admin' ? 'text-stone-300' : 'text-stone-500'
                  }">${pendingAdmin}</span>`
                : ''
            }
          </button>
        </div>
      </nav>

      <div class="p-3.5 border-t border-stone-100 bg-stone-50/70 shrink-0">
        <div class="flex items-center justify-between text-xs text-stone-600 mb-2">
          <span class="font-medium text-stone-700">Verified Campuses</span>
          <span class="font-mono text-[11px] tabular-nums text-stone-500">${state.institutions.length}</span>
        </div>
        <button type="button" data-action="open-add-campus"
          class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors whitespace-nowrap">
          ${icon('plus', 'w-3.5 h-3.5')} Add Alma Mater
        </button>
      </div>
    </div>
  `;

  return `
    <aside class="hidden lg:block w-[256px] shrink-0 h-screen sticky top-0 z-20">${inner}</aside>
    ${
      state.mobileMenuOpen
        ? `<div class="fixed inset-0 z-50 lg:hidden flex bg-stone-950/40 backdrop-blur-[1px]" data-action="close-mobile-menu">
            <aside class="w-[272px] max-w-[82vw] h-full shadow-xl" data-stop-prop="true">${inner}</aside>
          </div>`
        : ''
    }
  `;
}

export function renderTopHeader(state: AppState): string {
  const activeInst = getActiveInstitution(state);
  const theme = getActiveTheme(state);
  const unreadNotifs = state.notifications.filter((n) => !n.read).length;
  const unreadDms = state.threads.reduce((s, t) => s + t.unreadCount, 0);

  const q = state.globalSearch.trim().toLowerCase();
  const matchedAlumni = q
    ? state.alumni
        .filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.company.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];
  const matchedJobs = q
    ? state.jobs
        .filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];
  const matchedEvents = q
    ? state.events.filter((e) => e.title.toLowerCase().includes(q)).slice(0, 2)
    : [];
  const totalSearchHits = matchedAlumni.length + matchedJobs.length + matchedEvents.length;

  return `
    <header class="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-stone-200/90 px-4 lg:px-7 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2.5 min-w-0">
        <button type="button" data-action="open-mobile-menu" class="lg:hidden p-2 -ml-1 rounded-lg text-stone-600 hover:bg-stone-100" aria-label="Open menu">
          ${icon('menu', 'w-5 h-5')}
        </button>

        <!-- Institution Workspace Switcher -->
        <div class="relative" data-stop-prop="true">
          <button type="button" data-action="toggle-switcher"
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white transition-colors text-left max-w-[260px] sm:max-w-[310px]">
            ${
              state.activeWorkspace === 'all'
                ? icon('globe', 'w-4 h-4 text-stone-700')
                : renderCrest(activeInst?.crestVariant ?? 'columns', theme.primary, 18)
            }
            <span class="text-[13px] font-semibold text-stone-900 truncate">${esc(
              state.activeWorkspace === 'all'
                ? 'All Alma Maters (Unified)'
                : activeInst?.name ?? ''
            )}</span>
            ${icon('chevronDown', `w-3.5 h-3.5 text-stone-400 transition-transform ${state.switcherOpen ? 'rotate-180' : ''}`)}
          </button>

          ${
            state.switcherOpen
              ? `<div class="absolute left-0 mt-2 w-[328px] bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50">
                  <div class="px-3.5 py-1.5 text-[11px] font-semibold text-stone-400">Switch Institution Workspace</div>
                  <button type="button" data-action="switch-workspace" data-value="all"
                    class="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left ${
                      state.activeWorkspace === 'all' ? 'bg-stone-50' : 'hover:bg-stone-50'
                    }">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">${icon(
                        'globe',
                        'w-3.5 h-3.5'
                      )}</div>
                      <div class="min-w-0">
                        <div class="text-[13px] font-semibold text-stone-900 truncate">All Alma Maters (Unified View)</div>
                        <div class="text-[11px] text-stone-500 truncate">Combined feed, directory & events across ${
                          state.institutions.length
                        } campuses</div>
                      </div>
                    </div>
                    ${state.activeWorkspace === 'all' ? icon('check', 'w-4 h-4 text-stone-900') : ''}
                  </button>

                  <div class="my-1.5 border-t border-stone-100"></div>
                  <div class="px-3.5 py-1 text-[11px] font-semibold text-stone-400">Verified Institutions (${
                    state.institutions.length
                  })</div>

                  ${state.institutions
                    .map((inst) => {
                      const sel = state.activeWorkspace === inst.id;
                      return `
                        <button type="button" data-action="switch-workspace" data-value="${esc(inst.id)}"
                          class="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left ${
                            sel ? 'bg-stone-50' : 'hover:bg-stone-50'
                          }">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                              style="background-color:${esc(inst.theme.softBg)};border-color:${esc(inst.theme.softBorder)}">
                              ${renderCrest(inst.crestVariant, inst.theme.primary, 16)}
                            </div>
                            <div class="min-w-0">
                              <div class="text-[13px] font-semibold text-stone-900 truncate">${esc(inst.name)}</div>
                              <div class="text-[11px] text-stone-500 truncate">${esc(
                                inst.userCredential.degree
                              )} · Class of ${inst.userCredential.batchYear}</div>
                            </div>
                          </div>
                          ${sel ? `<span style="color:${esc(inst.theme.primary)}">${icon('check', 'w-4 h-4')}</span>` : ''}
                        </button>`;
                    })
                    .join('')}

                  <div class="mt-1.5 pt-1.5 border-t border-stone-100 px-2">
                    <button type="button" data-action="open-add-campus"
                      class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-stone-700 hover:bg-stone-100">
                      ${icon('plus', 'w-4 h-4 text-stone-500')} Add Another School / College
                    </button>
                  </div>
                </div>`
              : ''
          }
        </div>
      </div>

      <!-- Center Global Search -->
      <div class="hidden md:block flex-1 max-w-md relative" data-stop-prop="true">
        <span class="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">${icon('search', 'w-4 h-4')}</span>
        <input type="text" data-input="globalSearch" value="${esc(state.globalSearch)}"
          placeholder="Search alumni, companies, jobs, events..."
          class="w-full h-9.5 pl-9 pr-8 rounded-xl bg-stone-100/80 border border-stone-200/90 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-400 transition-colors" />
        ${
          state.globalSearch
            ? `<button type="button" data-action="clear-global-search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">${icon(
                'x',
                'w-3.5 h-3.5'
              )}</button>`
            : ''
        }

        ${
          state.globalSearchOpen && q
            ? `<div class="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
                ${
                  totalSearchHits === 0
                    ? `<div class="p-5 text-center text-xs text-stone-500">No matches found for “${esc(
                        state.globalSearch
                      )}”.</div>`
                    : `<div class="max-h-[380px] overflow-y-auto divide-y divide-stone-100">
                        ${
                          matchedAlumni.length > 0
                            ? `<div class="p-2">
                                <div class="px-2.5 py-1 text-[11px] font-semibold text-stone-400">Alumni</div>
                                ${matchedAlumni
                                  .map(
                                    (a) => `
                                  <button type="button" data-action="open-profile" data-id="${esc(a.id)}"
                                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-stone-50 text-left">
                                    ${renderAvatar({ name: a.name, initials: a.initials, tone: a.avatarTone, size: 'xs' })}
                                    <div class="min-w-0">
                                      <div class="text-xs font-semibold text-stone-900 truncate">${esc(a.name)}</div>
                                      <div class="text-[11px] text-stone-500 truncate">${esc(a.role)} at ${esc(
                                      a.company
                                    )} · ${esc(a.city)}</div>
                                    </div>
                                  </button>`
                                  )
                                  .join('')}
                              </div>`
                            : ''
                        }
                        ${
                          matchedJobs.length > 0
                            ? `<div class="p-2">
                                <div class="px-2.5 py-1 text-[11px] font-semibold text-stone-400">Jobs</div>
                                ${matchedJobs
                                  .map(
                                    (j) => `
                                  <button type="button" data-action="nav" data-section="jobs"
                                    class="w-full px-2.5 py-2 rounded-lg hover:bg-stone-50 text-left">
                                    <div class="text-xs font-semibold text-stone-900 truncate">${esc(j.title)}</div>
                                    <div class="text-[11px] text-stone-500 truncate">${esc(j.company)} · ${esc(j.location)}</div>
                                  </button>`
                                  )
                                  .join('')}
                              </div>`
                            : ''
                        }
                        ${
                          matchedEvents.length > 0
                            ? `<div class="p-2">
                                <div class="px-2.5 py-1 text-[11px] font-semibold text-stone-400">Events</div>
                                ${matchedEvents
                                  .map(
                                    (ev) => `
                                  <button type="button" data-action="nav" data-section="events"
                                    class="w-full px-2.5 py-2 rounded-lg hover:bg-stone-50 text-left">
                                    <div class="text-xs font-semibold text-stone-900 truncate">${esc(ev.title)}</div>
                                    <div class="text-[11px] text-stone-500 truncate">${esc(ev.dateDisplay)}</div>
                                  </button>`
                                  )
                                  .join('')}
                              </div>`
                            : ''
                        }
                      </div>`
                }
              </div>`
            : ''
        }
      </div>

      <!-- Right Controls: Notifications, DMs, Profile -->
      <div class="flex items-center gap-1.5 shrink-0">
        <div class="relative" data-stop-prop="true">
          <button type="button" data-action="toggle-notifs"
            class="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors" aria-label="Notifications">
            ${icon('bell', 'w-[18px] h-[18px]')}
            ${
              unreadNotifs > 0
                ? `<span class="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-[10px] font-mono font-semibold text-white flex items-center justify-center tabular-nums" style="background-color:${esc(
                    theme.primary
                  )}">${unreadNotifs}</span>`
                : ''
            }
          </button>
          ${
            state.notifOpen
              ? `<div class="absolute right-0 mt-2 w-[340px] max-w-[90vw] bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div class="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                    <span class="text-xs font-semibold text-stone-900">Notifications</span>
                    ${
                      unreadNotifs > 0
                        ? `<button type="button" data-action="mark-notifs-read" class="text-[11px] font-semibold text-stone-600 hover:text-stone-900">Mark all read</button>`
                        : ''
                    }
                  </div>
                  <div class="divide-y divide-stone-100 max-h-[340px] overflow-y-auto">
                    ${state.notifications
                      .map(
                        (n) => `
                      <button type="button" data-action="open-notif" data-section="${n.targetSection}" data-inst="${esc(
                          n.institutionId ?? ''
                        )}" class="w-full px-4 py-3 text-left hover:bg-stone-50 ${!n.read ? 'bg-stone-50/70' : ''}">
                        <div class="flex items-start justify-between gap-2">
                          <span class="text-xs font-semibold text-stone-900 leading-snug">${esc(n.title)}</span>
                          <span class="text-[11px] text-stone-400 shrink-0 tabular-nums">${esc(n.timestamp)}</span>
                        </div>
                        <p class="text-xs text-stone-600 mt-1 line-clamp-2">${esc(n.description)}</p>
                      </button>`
                      )
                      .join('')}
                  </div>
                </div>`
              : ''
          }
        </div>

        <button type="button" data-action="open-messages"
          class="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors" aria-label="Direct messages">
          ${icon('message', 'w-[18px] h-[18px]')}
          ${
            unreadDms > 0
              ? `<span class="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-stone-900 text-[10px] font-mono font-semibold text-white flex items-center justify-center tabular-nums">${unreadDms}</span>`
              : ''
          }
        </button>

        <div class="relative pl-1" data-stop-prop="true">
          <button type="button" data-action="toggle-profile-menu"
            class="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-stone-100 transition-colors">
            ${renderAvatar({ name: state.user.name, initials: 'RS', avatarUrl: state.user.avatarUrl, size: 'sm' })}
            <div class="hidden sm:block text-left leading-tight">
              <div class="text-xs font-semibold text-stone-900 whitespace-nowrap">${esc(state.user.name)}</div>
              <div class="text-[11px] text-stone-500 whitespace-nowrap">${state.institutions.length} Verified Campuses</div>
            </div>
            ${icon('chevronDown', 'w-3.5 h-3.5 text-stone-400 hidden sm:block')}
          </button>

          ${
            state.profileOpen
              ? `<div class="absolute right-0 mt-2 w-[310px] bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div class="p-4 border-b border-stone-100">
                    <div class="flex items-center gap-3">
                      ${renderAvatar({ name: state.user.name, initials: 'RS', avatarUrl: state.user.avatarUrl, size: 'md' })}
                      <div class="min-w-0">
                        <div class="text-sm font-semibold text-stone-900 truncate">${esc(state.user.name)}</div>
                        <div class="text-xs text-stone-500 truncate">${esc(state.user.role)} · ${esc(state.user.company)}</div>
                      </div>
                    </div>
                    <div class="mt-3 pt-3 border-t border-stone-100 space-y-1">
                      ${state.institutions
                        .map(
                          (i) => `
                        <div class="flex items-center justify-between text-[11px] text-stone-600">
                          <span class="truncate font-medium">${esc(i.shortName)}</span>
                          <span class="font-mono text-stone-400 tabular-nums">Class of ${i.userCredential.batchYear}</span>
                        </div>`
                        )
                        .join('')}
                    </div>
                  </div>
                  <div class="p-4 border-b border-stone-100 space-y-2.5">
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-stone-900">${icon(
                      'lock',
                      'w-3.5 h-3.5 text-stone-500'
                    )} Privacy Controls</div>
                    ${(
                      [
                        { key: 'showEmail', label: 'Show email in directory' },
                        { key: 'showPhone', label: 'Show phone number' },
                        { key: 'showCompany', label: 'Show current employer' },
                        { key: 'allowDirectMessages', label: 'Allow alumni DMs' },
                      ] as const
                    )
                      .map((p) => {
                        const on = state.user.privacy[p.key];
                        return `
                          <div class="flex items-center justify-between gap-2 text-xs text-stone-700">
                            <span>${p.label}</span>
                            <button type="button" role="switch" aria-checked="${on}" data-action="toggle-privacy" data-key="${p.key}"
                              class="w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center ${
                                on ? 'bg-stone-900 justify-end' : 'bg-stone-200 justify-start'
                              }">
                              <span class="w-3.5 h-3.5 rounded-full bg-white shadow-xs block"></span>
                            </button>
                          </div>`;
                      })
                      .join('')}
                  </div>
                  <div class="p-2 space-y-0.5">
                    <button type="button" data-action="nav" data-section="id-card"
                      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50">
                      ${icon('card', 'w-3.5 h-3.5 text-stone-500')} Digital Alumni ID Card
                    </button>
                    <button type="button" data-action="nav" data-section="admin"
                      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50">
                      ${icon('shield', 'w-3.5 h-3.5 text-stone-500')} Institutional Admin Portal
                    </button>
                  </div>
                </div>`
              : ''
          }
        </div>
      </div>
    </header>
  `;
}

export function renderOverlays(state: AppState): string {
  const theme = getActiveTheme(state);
  const selectedAlumnus = state.alumni.find((a) => a.id === state.selectedProfileId) ?? null;
  const userInstIds = new Set(state.institutions.map((i) => i.id));
  const activeThread =
    state.threads.find((t) => t.id === state.activeThreadId) ?? state.threads[0] ?? null;

  const canVerifyCampus =
    (state.addCampusMethod === 'email' &&
      state.addCampusOtpSent &&
      state.addCampusOtpCode.trim().length >= 4) ||
    (state.addCampusMethod === 'roll' && state.addCampusRollVerified) ||
    (state.addCampusMethod === 'peer' && state.addCampusPeerConfirmed);

  return `
    <!-- Profile Quick-View Drawer -->
    ${
      selectedAlumnus
        ? `<div class="fixed inset-0 z-50 flex justify-end bg-stone-950/35 backdrop-blur-[1px]" data-action="close-profile">
            <div class="w-full max-w-md bg-white h-full border-l border-stone-200 shadow-2xl flex flex-col" data-stop-prop="true">
              <div class="h-14 px-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                <span class="text-xs font-semibold text-stone-500">Unified Alumni Profile</span>
                <button type="button" data-action="close-profile" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                  'x',
                  'w-4 h-4'
                )}</button>
              </div>
              <div class="flex-1 overflow-y-auto p-6 space-y-6">
                <div class="flex items-start gap-4">
                  ${renderAvatar({
                    name: selectedAlumnus.name,
                    initials: selectedAlumnus.initials,
                    tone: selectedAlumnus.avatarTone,
                    size: 'xl',
                  })}
                  <div class="min-w-0">
                    <h2 class="font-editorial text-xl font-semibold text-stone-900 leading-tight">${esc(
                      selectedAlumnus.name
                    )}</h2>
                    <p class="text-sm text-stone-700 mt-0.5">${esc(selectedAlumnus.role)} at <span class="font-semibold">${esc(
            selectedAlumnus.company
          )}</span></p>
                    <div class="flex items-center gap-1.5 text-xs text-stone-500 mt-1.5">
                      ${icon('mapPin', 'w-3.5 h-3.5 text-stone-400')}
                      <span>${esc(selectedAlumnus.city)}, ${esc(selectedAlumnus.country)} · ${esc(
            selectedAlumnus.industry
          )}</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <button type="button" data-action="toggle-connect" data-id="${esc(selectedAlumnus.id)}"
                    class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                    style="${
                      selectedAlumnus.connected || selectedAlumnus.connectionPending
                        ? 'background-color:#F5F5F4;color:#1C1917'
                        : `background-color:${esc(theme.primary)};color:#FFFFFF`
                    }">
                    ${selectedAlumnus.connected ? 'Connected' : selectedAlumnus.connectionPending ? 'Requested' : 'Connect'}
                  </button>
                  <button type="button" data-action="message-alumnus" data-id="${esc(selectedAlumnus.id)}"
                    class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 whitespace-nowrap">
                    ${icon('message', 'w-3.5 h-3.5')} Message
                  </button>
                  <button type="button" data-action="mentor-alumnus" data-id="${esc(selectedAlumnus.id)}"
                    class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 whitespace-nowrap">
                    ${icon('grad', 'w-3.5 h-3.5')} Mentorship
                  </button>
                </div>

                <div class="space-y-2 pt-2 border-t border-stone-100">
                  <p class="text-sm text-stone-700 leading-relaxed">${esc(selectedAlumnus.bio)}</p>
                  ${
                    selectedAlumnus.openTo.length > 0
                      ? `<div class="text-xs text-stone-500"><span class="font-semibold text-stone-700">Open to: </span>${esc(
                          selectedAlumnus.openTo.join(' · ')
                        )}</div>`
                      : ''
                  }
                </div>

                <div class="space-y-3 pt-4 border-t border-stone-100">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-semibold text-stone-900">Verified Academic Credentials</h3>
                    <span class="text-xs font-semibold text-emerald-700">${
                      selectedAlumnus.credentials.filter((c) => userInstIds.has(c.institutionId)).length
                    } Shared Alma Mater</span>
                  </div>
                  <div class="space-y-2.5">
                    ${selectedAlumnus.credentials
                      .map((cred) => {
                        const inst = state.institutions.find((i) => i.id === cred.institutionId);
                        return `
                          <div class="flex items-start gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50/60">
                            ${renderCrest(inst?.crestVariant ?? 'columns', inst?.theme.primary ?? '#334155', 22)}
                            <div class="min-w-0 flex-1">
                              <div class="text-xs font-semibold text-stone-900 truncate">${esc(
                                inst?.name ?? cred.institutionId
                              )}</div>
                              <div class="text-xs text-stone-600 mt-0.5">${esc(cred.degree)} · ${esc(
                          cred.department
                        )}</div>
                              <div class="text-[11px] font-mono text-stone-500 mt-0.5 tabular-nums">Class of ${
                                cred.batchYear
                              }</div>
                            </div>
                          </div>`;
                      })
                      .join('')}
                  </div>
                </div>

                <div class="space-y-3 pt-4 border-t border-stone-100">
                  <h3 class="text-xs font-semibold text-stone-900">Career Timeline</h3>
                  <div class="space-y-3">
                    ${selectedAlumnus.careerTimeline
                      .map(
                        (e) => `
                      <div class="flex items-start gap-3">
                        <div class="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">${icon(
                          'briefcase',
                          'w-3.5 h-3.5 text-stone-600'
                        )}</div>
                        <div class="min-w-0">
                          <div class="text-xs font-semibold text-stone-900">${esc(e.role)}</div>
                          <div class="text-xs text-stone-600">${esc(e.company)} · ${esc(e.location)}</div>
                          <div class="text-[11px] font-mono text-stone-400 mt-0.5 tabular-nums">${esc(e.period)}</div>
                        </div>
                      </div>`
                      )
                      .join('')}
                  </div>
                </div>

                <div class="space-y-2 pt-4 border-t border-stone-100 text-xs">
                  <h3 class="font-semibold text-stone-900">Contact & Privacy</h3>
                  <div class="flex items-center justify-between py-1.5">
                    <span class="flex items-center gap-2 text-stone-500">${icon('mail', 'w-3.5 h-3.5')} Email</span>
                    ${
                      selectedAlumnus.showEmail
                        ? `<span class="font-mono text-stone-800">${esc(selectedAlumnus.email)}</span>`
                        : `<span class="text-stone-400">Hidden by member</span>`
                    }
                  </div>
                  <div class="flex items-center justify-between py-1.5 border-t border-stone-100">
                    <span class="flex items-center gap-2 text-stone-500">${icon('phone', 'w-3.5 h-3.5')} Phone</span>
                    ${
                      selectedAlumnus.showPhone
                        ? `<span class="font-mono text-stone-800 tabular-nums">${esc(selectedAlumnus.phone)}</span>`
                        : `<span class="text-stone-400">Private — use Direct Message</span>`
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>`
        : ''
    }

    <!-- Direct Messages Drawer -->
    ${
      state.messagesOpen
        ? `<div class="fixed inset-0 z-50 flex justify-end bg-stone-950/35 backdrop-blur-[1px]" data-action="close-messages">
            <div class="w-full max-w-2xl bg-white h-full border-l border-stone-200 shadow-2xl flex flex-col" data-stop-prop="true">
              <div class="h-14 px-5 border-b border-stone-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 class="text-sm font-semibold text-stone-900">Direct Messages</h2>
                  <p class="text-[11px] text-stone-500">Verified cross-campus alumni inbox</p>
                </div>
                <button type="button" data-action="close-messages" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                  'x',
                  'w-4 h-4'
                )}</button>
              </div>
              <div class="flex-1 flex min-h-0">
                <div class="w-[220px] sm:w-[240px] border-r border-stone-100 overflow-y-auto shrink-0 divide-y divide-stone-100">
                  ${state.threads
                    .map((t) => {
                      const active = activeThread?.id === t.id;
                      const last = t.messages[t.messages.length - 1];
                      return `
                        <button type="button" data-action="select-thread" data-id="${esc(t.id)}"
                          class="w-full p-3.5 text-left transition-colors ${active ? 'bg-stone-100/90' : 'hover:bg-stone-50'}">
                          <div class="flex items-center gap-2.5">
                            ${renderAvatar({ name: t.alumnusName, initials: t.alumnusInitials, tone: t.alumnusTone, size: 'sm' })}
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center justify-between gap-1">
                                <span class="text-xs font-semibold text-stone-900 truncate">${esc(t.alumnusName)}</span>
                                ${
                                  t.unreadCount > 0
                                    ? `<span class="text-[10px] font-mono font-semibold text-white px-1.5 rounded-full" style="background-color:${esc(
                                        theme.primary
                                      )}">${t.unreadCount}</span>`
                                    : ''
                                }
                              </div>
                              <p class="text-[11px] text-stone-500 truncate mt-0.5">${esc(
                                last ? last.text : 'Start a conversation'
                              )}</p>
                            </div>
                          </div>
                        </button>`;
                    })
                    .join('')}
                </div>
                <div class="flex-1 flex flex-col min-w-0">
                  ${
                    activeThread
                      ? `<div class="px-5 py-3 border-b border-stone-100 bg-stone-50/50">
                          <div class="text-xs font-semibold text-stone-900">${esc(activeThread.alumnusName)}</div>
                          <div class="text-[11px] text-stone-500 truncate">${esc(activeThread.alumnusMeta)}</div>
                        </div>
                        <div class="flex-1 overflow-y-auto p-5 space-y-3">
                          ${
                            activeThread.messages.length === 0
                              ? `<div class="text-center py-12 text-xs text-stone-400">Say hello to ${esc(
                                  activeThread.alumnusName
                                )}.</div>`
                              : activeThread.messages
                                  .map(
                                    (m) => `
                                <div class="flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}">
                                  <div class="max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                                    m.sender === 'me' ? 'text-white' : 'bg-stone-100 text-stone-800'
                                  }" ${
                                      m.sender === 'me' ? `style="background-color:${esc(theme.primary)}"` : ''
                                    }>${esc(m.text)}</div>
                                  <span class="text-[10px] text-stone-400 mt-1 tabular-nums">${esc(m.timestamp)}</span>
                                </div>`
                                  )
                                  .join('')
                          }
                        </div>
                        <form data-form="send-dm" data-thread-id="${esc(
                          activeThread.id
                        )}" class="p-3.5 border-t border-stone-100 flex items-center gap-2 bg-white">
                          <input type="text" name="message" required placeholder="Message ${esc(
                            activeThread.alumnusName
                          )}..." class="flex-1 h-9 px-3.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
                          <button type="submit" class="h-9 px-3.5 rounded-lg text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap" style="background-color:${esc(
                            theme.primary
                          )}">${icon('send', 'w-3.5 h-3.5')} Send</button>
                        </form>`
                      : ''
                  }
                </div>
              </div>
            </div>
          </div>`
        : ''
    }

    <!-- Add Another School/College Verification Modal -->
    ${
      state.addCampusOpen
        ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-[2px] p-4 overflow-y-auto" data-action="close-add-campus">
            <div class="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-auto" data-stop-prop="true">
              <div class="flex items-start justify-between px-6 py-4 border-b border-stone-100">
                <div>
                  <h2 class="text-base font-semibold text-stone-900">Add Another School or College</h2>
                  <p class="text-xs text-stone-500 mt-0.5">Verify and attach a new alma mater to Rohan Sharma's unified identity.</p>
                </div>
                <button type="button" data-action="close-add-campus" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                  'x',
                  'w-4 h-4'
                )}</button>
              </div>
              <div class="p-6 max-h-[80vh] overflow-y-auto space-y-4">
                <div class="flex items-center gap-3 text-xs text-stone-500 pb-4 border-b border-stone-100">
                  <span class="${state.addCampusStep >= 1 ? 'font-semibold text-stone-900' : ''}">1. Institution Details</span>
                  <span>/</span>
                  <span class="${state.addCampusStep >= 2 ? 'font-semibold text-stone-900' : ''}">2. Alumni Verification</span>
                  <span>/</span>
                  <span class="${state.addCampusStep === 3 ? 'font-semibold text-emerald-700' : ''}">3. Workspace Linked</span>
                </div>

                ${
                  state.addCampusStep === 1
                    ? `<form data-form="add-campus-step1" class="space-y-4">
                        <div>
                          <label class="block text-xs font-semibold text-stone-700 mb-1.5">Quick-select campus or enter below</label>
                          <div class="grid grid-cols-2 gap-2">
                            ${CAMPUS_PRESETS.map(
                              (p) => `
                              <button type="button" data-action="pick-campus-preset" data-name="${esc(p.name)}" data-type="${esc(
                                p.type
                              )}" data-loc="${esc(p.location)}" data-domain="${esc(p.domain)}"
                                class="px-3 py-2 rounded-xl border text-left transition-colors ${
                                  state.addCampusName === p.name
                                    ? 'border-stone-900 bg-stone-50'
                                    : 'border-stone-200 hover:border-stone-300'
                                }">
                                <div class="text-xs font-semibold text-stone-900 truncate">${esc(p.name)}</div>
                                <div class="text-[11px] text-stone-500 truncate">${esc(p.location)}</div>
                              </button>`
                            ).join('')}
                          </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-stone-700 mb-1">Institution Name</label>
                            <input type="text" name="name" required value="${esc(state.addCampusName)}" placeholder="e.g., IIT Bombay"
                              class="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-stone-700 mb-1">Institution Type</label>
                            <select name="type" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                              ${['University', 'Engineering Institute', 'Business School', 'High School']
                                .map((t) => `<option value="${t}" ${state.addCampusType === t ? 'selected' : ''}>${t}</option>`)
                                .join('')}
                            </select>
                          </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div class="sm:col-span-2">
                            <label class="block text-xs font-medium text-stone-700 mb-1">Degree / Program</label>
                            <input type="text" name="degree" required value="${esc(state.addCampusDegree)}" placeholder="e.g., Executive Program in AI"
                              class="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-stone-700 mb-1">Graduation Year</label>
                            <input type="number" name="batch" required value="${esc(state.addCampusBatch)}" class="w-full h-9 px-3 rounded-lg border border-stone-200 font-mono text-sm" />
                          </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-stone-700 mb-1">Department / Stream</label>
                            <input type="text" name="dept" value="${esc(state.addCampusDept)}" placeholder="Computer Science"
                              class="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-stone-700 mb-1">City</label>
                            <input type="text" name="location" value="${esc(state.addCampusLocation)}" placeholder="Mumbai, Maharashtra"
                              class="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                          </div>
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                          <button type="button" data-action="close-add-campus" class="px-4 py-2 text-xs font-medium text-stone-600">Cancel</button>
                          <button type="submit" class="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">Continue to Verification</button>
                        </div>
                      </form>`
                    : state.addCampusStep === 2
                    ? `<div class="space-y-4">
                        <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                          Verifying <span class="font-semibold text-stone-900">${esc(state.addCampusName)}</span> · ${esc(
                        state.addCampusDegree
                      )} · Class of <span class="font-mono">${esc(state.addCampusBatch)}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                          ${(
                            [
                              { id: 'email', label: '.edu / .ac.in Email', ic: 'mail' as const },
                              { id: 'roll', label: 'Roll Number Check', ic: 'hash' as const },
                              { id: 'peer', label: 'Peer Vouching', ic: 'users' as const },
                            ] as const
                          )
                            .map(
                              (m) => `
                            <button type="button" data-action="set-campus-method" data-value="${m.id}"
                              class="p-3 rounded-xl border text-left transition-colors ${
                                state.addCampusMethod === m.id
                                  ? 'border-stone-900 bg-stone-900 text-white'
                                  : 'border-stone-200 text-stone-700 hover:border-stone-300'
                              }">
                              ${icon(m.ic, 'w-4 h-4 mb-1.5')}
                              <div class="text-xs font-semibold leading-tight">${m.label}</div>
                            </button>`
                            )
                            .join('')}
                        </div>

                        ${
                          state.addCampusMethod === 'email'
                            ? `<div class="space-y-3">
                                <div class="flex gap-2">
                                  <input type="email" data-input="addCampusEmail" value="${esc(state.addCampusEmail)}"
                                    class="flex-1 h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                                  <button type="button" data-action="send-campus-otp"
                                    class="px-3.5 h-9 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 whitespace-nowrap">
                                    ${state.addCampusOtpSent ? 'Resend OTP' : 'Send OTP'}
                                  </button>
                                </div>
                                ${
                                  state.addCampusOtpSent
                                    ? `<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                                        <div class="text-xs text-emerald-800">Simulated 6-digit code sent to <span class="font-mono">${esc(
                                          state.addCampusEmail
                                        )}</span> (auto-filled).</div>
                                        <input type="text" data-input="addCampusOtpCode" value="${esc(
                                          state.addCampusOtpCode
                                        )}" class="w-40 h-9 px-3 rounded-lg border border-emerald-300 bg-white font-mono text-sm tracking-widest" />
                                      </div>`
                                    : ''
                                }
                              </div>`
                            : state.addCampusMethod === 'roll'
                            ? `<div class="space-y-3">
                                <div class="flex gap-2">
                                  <input type="text" data-input="addCampusRoll" value="${esc(state.addCampusRoll)}"
                                    class="flex-1 h-9 px-3 rounded-lg border border-stone-200 font-mono text-sm" />
                                  <button type="button" data-action="verify-campus-roll"
                                    class="px-3.5 h-9 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800">Verify Registry</button>
                                </div>
                                ${
                                  state.addCampusRollVerified
                                    ? `<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">${icon(
                                        'check',
                                        'w-4 h-4'
                                      )} Exact Registrar Match confirmed for <span class="font-mono font-semibold">${esc(
                                        state.addCampusRoll
                                      )}</span>.</div>`
                                    : ''
                                }
                              </div>`
                            : `<div class="space-y-3">
                                <p class="text-xs text-stone-600">Request instant confirmation from 2 verified classmates on AlmaOne (Ananya Deshmukh & Vikram Nair).</p>
                                <button type="button" data-action="confirm-campus-peer"
                                  class="px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800">
                                  ${state.addCampusPeerConfirmed ? '2/2 Peer Vouches Confirmed' : 'Send & Simulate Peer Vouch'}
                                </button>
                                ${
                                  state.addCampusPeerConfirmed
                                    ? `<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">${icon(
                                        'check',
                                        'w-4 h-4'
                                      )} 2 verified peers vouched for your graduation cohort.</div>`
                                    : ''
                                }
                              </div>`
                        }

                        <div class="flex items-center justify-between pt-3 border-t border-stone-100">
                          <button type="button" data-action="campus-back" class="px-3 py-2 text-xs font-medium text-stone-600">Back</button>
                          <button type="button" data-action="complete-add-campus" ${canVerifyCampus ? '' : 'disabled'}
                            class="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-semibold">
                            Verify & Link Institution
                          </button>
                        </div>
                      </div>`
                    : `<div class="text-center py-4 space-y-3">
                        <div class="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">${icon(
                          'check',
                          'w-5 h-5'
                        )}</div>
                        <h3 class="font-editorial text-lg font-semibold text-stone-900">${esc(
                          state.addCampusName
                        )} is now linked to your profile</h3>
                        <p class="text-xs text-stone-600 max-w-sm mx-auto">Your workspace switcher, unified feed, and Digital Alumni ID have been updated.</p>
                        <button type="button" data-action="close-add-campus" class="mt-2 px-5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold">Open Workspace</button>
                      </div>`
                }
              </div>
            </div>
          </div>`
        : ''
    }

    <!-- Quiet Toast Notification -->
    ${
      state.toast
        ? `<div role="status" aria-live="polite"
            class="fixed bottom-5 right-5 z-50 max-w-sm bg-stone-900 text-white px-4 py-3 rounded-xl shadow-lg border border-stone-800 flex items-center gap-2.5 text-xs font-medium">
            ${icon('check', 'w-4 h-4 text-emerald-400')}
            <span class="leading-snug">${esc(state.toast)}</span>
            <button type="button" data-action="dismiss-toast" class="ml-1 text-stone-400 hover:text-white">${icon(
              'x',
              'w-3.5 h-3.5'
            )}</button>
          </div>`
        : ''
    }
  `;
}
