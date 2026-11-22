import { UNIFIED_BANNER_URL } from '../data/mockData';
import { AppState, getActiveInstitution, getActiveTheme } from '../state/store';
import { Alumnus, OpenToTag } from '../types/alumni';
import { esc, icon, renderAvatar, renderCrest } from '../utils/ui';

const OPEN_TO_OPTIONS: OpenToTag[] = [
  'Hiring',
  'Open to Mentoring',
  'Available for Coffee',
  'Seeking Co-founder',
];

const CITY_COORDS: Record<string, { x: number; y: number }> = {
  Bengaluru: { x: 64, y: 69 },
  Hyderabad: { x: 66, y: 60 },
  Mumbai: { x: 57, y: 58 },
  'Delhi NCR': { x: 63, y: 42 },
  'San Francisco Bay Area': { x: 16, y: 42 },
  London: { x: 43, y: 31 },
  Singapore: { x: 80, y: 74 },
};

const EXPERTISE_FILTERS = [
  'All Topics',
  'Product Management',
  'Higher Studies Abroad',
  'Startup Fundraising',
  'Software Engineering',
  'Consulting & Strategy',
];

function emptyState(title: string, desc: string, actionAttr?: string, actionLabel?: string): string {
  return `
    <div class="bg-white border border-stone-200/90 rounded-2xl p-10 text-center">
      <h3 class="text-sm font-semibold text-stone-900">${esc(title)}</h3>
      <p class="text-sm text-stone-500 mt-1 max-w-md mx-auto">${esc(desc)}</p>
      ${
        actionAttr && actionLabel
          ? `<button type="button" ${actionAttr} class="mt-4 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap">${esc(
              actionLabel
            )}</button>`
          : ''
      }
    </div>
  `;
}

// ============================================================================
// 1. HOME FEED VIEW
// ============================================================================
export function renderHomeFeedView(state: AppState): string {
  const activeInst = getActiveInstitution(state);
  const theme = getActiveTheme(state);
  const bannerUrl = activeInst ? activeInst.bannerUrl : UNIFIED_BANNER_URL;
  const totalVerified = state.institutions.reduce((s, i) => s + i.verifiedCount, 0);

  const visiblePosts = state.posts.filter((p) => {
    const wsOk =
      state.activeWorkspace === 'all' ||
      p.institutionId === state.activeWorkspace ||
      p.institutionId === 'all';
    const typeOk = state.feedFilter === 'all' || p.type === state.feedFilter;
    return wsOk && typeOk;
  });

  const upcomingReunions = state.events
    .filter(
      (ev) =>
        (state.activeWorkspace === 'all' || ev.institutionId === state.activeWorkspace) &&
        (ev.category === 'Milestone Reunion' || ev.category === 'City Meetup')
    )
    .slice(0, 3);

  const nearbyAlumni = state.alumni
    .filter(
      (a) =>
        a.city === state.user.city &&
        (state.activeWorkspace === 'all' ||
          a.credentials.some((c) => c.institutionId === state.activeWorkspace))
    )
    .slice(0, 4);

  return `
    <div class="space-y-6">
      <!-- Institutional Campus Architectural Banner -->
      <section class="relative rounded-2xl overflow-hidden border border-stone-200/90 bg-stone-900 min-h-[210px] sm:min-h-[232px] flex items-end shadow-xs">
        <img src="${esc(bannerUrl)}" alt="${esc(
    activeInst ? activeInst.name : 'All Alma Maters campus'
  )}" referrerpolicy="no-referrer" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-stone-950/92 via-stone-950/50 to-stone-950/15"></div>

        <div class="relative z-10 w-full p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div class="space-y-2 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2 text-xs text-stone-200/90">
              <span>${esc(
                activeInst
                  ? `${activeInst.type} · ${activeInst.location}`
                  : `Unified Multi-Campus Network · ${state.institutions.length} Verified Institutions`
              )}</span>
              <span aria-hidden="true">·</span>
              <span class="font-mono tabular-nums">${esc(
                activeInst
                  ? `Est. ${activeInst.foundedYear}`
                  : `${totalVerified.toLocaleString('en-IN')} Verified Alumni`
              )}</span>
            </div>
            <h1 class="font-editorial text-2xl sm:text-[34px] font-semibold text-white tracking-tight leading-[1.12]">
              ${esc(activeInst ? activeInst.name : 'All Alma Maters — Unified Feed')}
            </h1>
            <p class="text-xs sm:text-sm text-stone-200/90">
              ${esc(
                activeInst
                  ? `Verified as ${activeInst.userCredential.degree} · Class of ${activeInst.userCredential.batchYear} · Roll ${activeInst.userCredential.rollNumber}`
                  : `${state.user.name} · ${state.institutions
                      .map((i) => `${i.shortName} ’${String(i.userCredential.batchYear).slice(-2)}`)
                      .join(' · ')}`
              )}
            </p>
          </div>

          <div class="flex items-center gap-2.5 shrink-0">
            <button type="button" data-action="nav" data-section="id-card"
              class="px-4 py-2.5 rounded-lg bg-white/14 hover:bg-white/24 backdrop-blur-xs border border-white/25 text-xs font-semibold text-white transition-colors whitespace-nowrap">
              Digital Alumni ID
            </button>
            <button type="button" data-action="nav" data-section="directory"
              class="px-4 py-2.5 rounded-lg bg-white hover:bg-stone-100 text-stone-900 text-xs font-semibold transition-colors whitespace-nowrap">
              Explore Directory
            </button>
          </div>
        </div>
      </section>

      <!-- 2-Column Feed & Network Snapshot -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div class="xl:col-span-8 space-y-5">
          <!-- Post Composer -->
          <form data-form="create-post" class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-3.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                ${renderAvatar({ name: state.user.name, initials: 'RS', avatarUrl: state.user.avatarUrl, size: 'sm' })}
                <span class="text-xs font-semibold text-stone-900">Share an update, question, or milestone</span>
              </div>
              <div class="inline-flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg border border-stone-200/70">
                ${(['update', 'question', 'milestone'] as const)
                  .map(
                    (t) => `
                  <button type="button" data-action="set-composer-type" data-value="${t}"
                    class="px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                      state.composerType === t
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }">${t}</button>`
                  )
                  .join('')}
              </div>
            </div>

            ${
              state.composerType === 'milestone'
                ? `<div class="flex flex-wrap items-center gap-2 text-xs">
                    <span class="text-stone-500">Milestone:</span>
                    ${['Career Promotion', 'Startup Launch', 'Higher Studies', 'Book / Award']
                      .map(
                        (m) => `
                      <button type="button" data-action="set-composer-milestone" data-value="${esc(m)}"
                        class="px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                          state.composerMilestone === m
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }">${esc(m)}</button>`
                      )
                      .join('')}
                  </div>`
                : ''
            }

            <input type="text" name="title" value="${esc(state.composerTitle)}"
              placeholder="${
                state.composerType === 'question'
                  ? 'Question headline (e.g., Recommendations for SaaS legal counsel?)'
                  : state.composerType === 'milestone'
                  ? 'Milestone headline (e.g., Stepping into VP of Engineering...)'
                  : 'Optional headline...'
              }"
              class="w-full h-9.5 px-3.5 rounded-lg border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400" />

            <textarea name="content" rows="2" required
              placeholder="Write an update, ask peers for advice, or celebrate a batch milestone..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 resize-none">${esc(
                state.composerContent
              )}</textarea>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div class="flex items-center gap-2 text-xs text-stone-500">
                <span>Publish to:</span>
                ${
                  state.activeWorkspace === 'all'
                    ? `<select name="institutionId" class="h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none">
                        ${state.institutions
                          .map(
                            (i) =>
                              `<option value="${esc(i.id)}" ${
                                state.composerInstId === i.id ? 'selected' : ''
                              }>${esc(i.name)}</option>`
                          )
                          .join('')}
                      </select>`
                    : `<span class="font-semibold text-stone-800">${esc(activeInst?.name ?? '')}</span>`
                }
              </div>

              <button type="submit"
                class="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors whitespace-nowrap"
                style="background-color:${esc(theme.primary)}">
                Publish Post
              </button>
            </div>
          </form>

          <!-- Filter Tabs -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
            <div class="flex items-center gap-1">
              ${(
                [
                  { id: 'all', label: 'All Activity' },
                  { id: 'announcement', label: 'Campus Notices' },
                  { id: 'milestone', label: 'Milestones' },
                  { id: 'poll', label: 'Polls' },
                ] as const
              )
                .map(
                  (tab) => `
                <button type="button" data-action="set-feed-filter" data-value="${tab.id}"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    state.feedFilter === tab.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }">${tab.label}</button>`
                )
                .join('')}
            </div>
            <span class="text-xs font-mono text-stone-500 tabular-nums">${visiblePosts.length} posts</span>
          </div>

          <!-- Posts Stream -->
          ${
            visiblePosts.length === 0
              ? emptyState(
                  'No posts match this filter',
                  'Switch back to All Activity or share the first update for this campus.',
                  'data-action="set-feed-filter" data-value="all"',
                  'Show All Activity'
                )
              : `<div class="space-y-4">
                  ${visiblePosts
                    .map((post) => {
                      const postInst = state.institutions.find((i) => i.id === post.institutionId);
                      const accent = postInst?.theme.primary ?? theme.primary;
                      const matchedAlum = state.alumni.find((a) => a.id === post.authorId);
                      const totalVotes = post.poll
                        ? post.poll.options.reduce((s, o) => s + o.votes, 0)
                        : 0;
                      const commentsOpen = !!state.openComments[post.id];

                      return `
                        <article class="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-3.5">
                          <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3 min-w-0">
                              <button type="button" ${
                                matchedAlum
                                  ? `data-action="open-profile" data-id="${esc(matchedAlum.id)}"`
                                  : ''
                              } class="${matchedAlum ? 'cursor-pointer' : 'cursor-default'}">
                                ${renderAvatar({
                                  name: post.authorName,
                                  initials: post.authorInitials,
                                  tone: post.authorTone,
                                  avatarUrl: post.authorAvatarUrl,
                                  size: 'md',
                                })}
                              </button>
                              <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <button type="button" ${
                                    matchedAlum
                                      ? `data-action="open-profile" data-id="${esc(matchedAlum.id)}"`
                                      : ''
                                  } class="text-sm font-semibold text-stone-900 ${
                        matchedAlum ? 'hover:underline' : ''
                      }">${esc(post.authorName)}</button>
                                  <span class="text-xs text-stone-400">·</span>
                                  <span class="text-xs text-stone-500 tabular-nums">${esc(post.timestamp)}</span>
                                </div>
                                <div class="text-xs text-stone-500 truncate">${esc(post.authorRole)} · ${esc(
                        post.authorCredentialLabel
                      )}</div>
                              </div>
                            </div>
                            ${
                              postInst && state.activeWorkspace === 'all'
                                ? `<div class="flex items-center gap-1.5 text-xs text-stone-600 shrink-0">
                                    ${renderCrest(postInst.crestVariant, postInst.theme.primary, 16)}
                                    <span class="hidden sm:inline font-medium">${esc(postInst.shortName)}</span>
                                  </div>`
                                : ''
                            }
                          </div>

                          ${
                            post.isOfficialBroadcast || post.milestoneLabel || post.type === 'question'
                              ? `<div class="text-xs font-semibold" style="color:${esc(accent)}">
                                  ${esc(
                                    post.isOfficialBroadcast
                                      ? `Campus Broadcast · ${post.broadcastSegment ?? 'Verified Alumni'}`
                                      : post.milestoneLabel
                                      ? `Milestone Spotlight · ${post.milestoneLabel}`
                                      : 'Community Question'
                                  )}
                                </div>`
                              : ''
                          }

                          <div class="space-y-1.5">
                            ${
                              post.title
                                ? `<h3 class="font-editorial text-lg font-semibold text-stone-900 leading-snug">${esc(
                                    post.title
                                  )}</h3>`
                                : ''
                            }
                            <p class="text-[14.5px] text-stone-700 leading-relaxed">${esc(post.content)}</p>
                          </div>

                          ${
                            post.poll
                              ? `<div class="pt-2 space-y-2.5">
                                  <div class="flex items-center justify-between text-xs text-stone-600">
                                    <span class="font-semibold text-stone-900">${esc(post.poll.question)}</span>
                                    <span class="font-mono text-[11px] tabular-nums text-stone-500">${totalVotes} votes · ${esc(
                                  post.poll.closesIn
                                )}</span>
                                  </div>
                                  <div class="space-y-2">
                                    ${post.poll.options
                                      .map((opt) => {
                                        const pct =
                                          totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                        const chosen = post.poll?.votedOptionId === opt.id;
                                        return `
                                          <button type="button" data-action="vote-poll" data-post-id="${esc(
                                            post.id
                                          )}" data-option-id="${esc(opt.id)}"
                                            class="w-full relative overflow-hidden rounded-xl border px-4 py-2.5 text-left transition-colors ${
                                              chosen
                                                ? 'border-stone-900 bg-stone-50'
                                                : 'border-stone-200 hover:border-stone-300 bg-white'
                                            }">
                                            <div class="absolute inset-y-0 left-0 transition-all duration-300" style="width:${pct}%;background-color:${
                                          chosen ? `${accent}18` : '#F5F5F4'
                                        }"></div>
                                            <div class="relative flex items-center justify-between gap-3 text-xs">
                                              <span class="font-medium ${
                                                chosen ? 'text-stone-900' : 'text-stone-700'
                                              }">${esc(opt.label)}${chosen ? ' (Your vote)' : ''}</span>
                                              <span class="font-mono font-semibold text-stone-800 tabular-nums shrink-0">${pct}%</span>
                                            </div>
                                          </button>`;
                                      })
                                      .join('')}
                                  </div>
                                </div>`
                              : ''
                          }

                          <div class="pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                            <div class="flex items-center gap-5">
                              <button type="button" data-action="toggle-like" data-id="${esc(post.id)}"
                                class="inline-flex items-center gap-1.5 font-medium transition-colors ${
                                  post.likedByMe ? 'text-rose-600' : 'hover:text-stone-900'
                                }">
                                ${icon('heart', 'w-4 h-4', post.likedByMe)}
                                <span class="tabular-nums">${post.likes}</span>
                              </button>
                              <button type="button" data-action="toggle-comments" data-id="${esc(post.id)}"
                                class="inline-flex items-center gap-1.5 font-medium hover:text-stone-900 transition-colors">
                                ${icon('comment', 'w-4 h-4')}
                                <span class="tabular-nums">${post.comments.length} Comments</span>
                              </button>
                            </div>
                            <button type="button" data-action="toggle-bookmark" data-id="${esc(post.id)}"
                              class="inline-flex items-center gap-1.5 font-medium transition-colors ${
                                post.bookmarked ? 'text-stone-900' : 'hover:text-stone-900'
                              }">
                              ${icon('bookmark', 'w-4 h-4', post.bookmarked)}
                              ${post.bookmarked ? 'Saved' : 'Save'}
                            </button>
                          </div>

                          ${
                            commentsOpen
                              ? `<div class="pt-3 border-t border-stone-100 space-y-3">
                                  ${post.comments
                                    .map(
                                      (c) => `
                                    <div class="flex items-start gap-2.5 text-xs">
                                      ${renderAvatar({
                                        name: c.authorName,
                                        initials: c.authorInitials,
                                        tone: '#57534E',
                                        size: 'xs',
                                      })}
                                      <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5">
                                          <span class="font-semibold text-stone-900">${esc(c.authorName)}</span>
                                          <span class="text-stone-400">·</span>
                                          <span class="text-stone-500">${esc(c.authorMeta)}</span>
                                          <span class="text-stone-400">·</span>
                                          <span class="text-stone-400 tabular-nums">${esc(c.timestamp)}</span>
                                        </div>
                                        <p class="text-stone-700 mt-0.5 leading-relaxed">${esc(c.content)}</p>
                                      </div>
                                    </div>`
                                    )
                                    .join('')}
                                  <form data-form="add-comment" data-post-id="${esc(post.id)}" class="flex items-center gap-2 pt-1">
                                    <input type="text" name="comment" required placeholder="Write a reply..."
                                      class="flex-1 h-8.5 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
                                    <button type="submit" class="h-8.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1">
                                      ${icon('send', 'w-3 h-3')} Reply
                                    </button>
                                  </form>
                                </div>`
                              : ''
                          }
                        </article>`;
                    })
                    .join('')}
                </div>`
          }
        </div>

        <!-- Right Sidebar Widgets -->
        <aside class="xl:col-span-4 space-y-5">
          <!-- Batch Snapshot -->
          <div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-stone-900">${esc(
                activeInst ? `${activeInst.shortName} Snapshot` : 'Your Network Reach'
              )}</h2>
              <span class="text-stone-400">${icon('users', 'w-4 h-4')}</span>
            </div>
            <div class="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div class="text-xl font-bold font-mono text-stone-900 tabular-nums">${(
                  activeInst ? activeInst.verifiedCount : totalVerified
                ).toLocaleString('en-IN')}</div>
                <div class="text-xs text-stone-500 mt-0.5">Verified Alumni</div>
              </div>
              <div>
                <div class="text-xl font-bold font-mono text-stone-900 tabular-nums">${
                  activeInst ? activeInst.activeBatchRate : 78
                }%</div>
                <div class="text-xs text-stone-500 mt-0.5">Batch Activation</div>
              </div>
              <div>
                <div class="text-xl font-bold font-mono text-stone-900 tabular-nums">${
                  state.alumni.filter((a) => a.openTo.includes('Hiring')).length
                }</div>
                <div class="text-xs text-stone-500 mt-0.5">Alumni Hiring Now</div>
              </div>
              <div>
                <div class="text-xl font-bold font-mono text-stone-900 tabular-nums">${
                  state.events.filter((e) => e.rsvped).length
                }</div>
                <div class="text-xs text-stone-500 mt-0.5">Active Event RSVPs</div>
              </div>
            </div>
          </div>

          <!-- Upcoming Milestone Reunions -->
          <div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-stone-900">Upcoming Reunions & Meetups</h2>
              <button type="button" data-action="nav" data-section="events"
                class="text-xs font-semibold hover:underline" style="color:${esc(theme.primary)}">View all</button>
            </div>
            <div class="divide-y divide-stone-100">
              ${upcomingReunions
                .map(
                  (ev) => `
                <button type="button" data-action="nav" data-section="events"
                  class="w-full py-3 first:pt-0 last:pb-0 text-left hover:bg-stone-50 -mx-2 px-2 rounded-lg transition-colors">
                  <div class="text-xs font-semibold text-stone-900 leading-snug">${esc(ev.title)}</div>
                  <div class="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
                    ${icon('calendar', 'w-3 h-3')}
                    <span class="truncate">${esc(ev.dateDisplay)}</span>
                  </div>
                  <div class="text-[11px] text-stone-500 mt-0.5 tabular-nums">${ev.rsvpCount} attending · ${esc(
                    ev.priceDisplay
                  )}${ev.rsvped ? ' · Registered' : ''}</div>
                </button>`
                )
                .join('')}
            </div>
          </div>

          <!-- Alumni Near You -->
          <div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-stone-900">Alumni Near You · ${esc(state.user.city)}</h2>
                <p class="text-[11px] text-stone-500 mt-0.5">Verified classmates within 10 km</p>
              </div>
              <span class="text-stone-400">${icon('mapPin', 'w-4 h-4')}</span>
            </div>
            <div class="divide-y divide-stone-100">
              ${nearbyAlumni
                .map(
                  (alum) => `
                <button type="button" data-action="open-profile" data-id="${esc(alum.id)}"
                  class="w-full py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 text-left hover:bg-stone-50 -mx-2 px-2 rounded-lg transition-colors">
                  ${renderAvatar({ name: alum.name, initials: alum.initials, tone: alum.avatarTone, size: 'sm' })}
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-semibold text-stone-900 truncate">${esc(alum.name)}</div>
                    <div class="text-[11px] text-stone-500 truncate">${esc(alum.role)} · ${esc(alum.company)}</div>
                  </div>
                  ${
                    alum.distanceKm
                      ? `<span class="text-[11px] font-mono text-stone-400 tabular-nums shrink-0">${alum.distanceKm} km</span>`
                      : ''
                  }
                </button>`
                )
                .join('')}
            </div>
            <button type="button" data-action="nav" data-section="directory"
              class="w-full py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors">
              Open City Cluster Directory
            </button>
          </div>
        </aside>
      </div>
    </div>
  `;
}

// ============================================================================
// 2. SMART ALUMNI DIRECTORY VIEW
// ============================================================================
export function renderDirectoryView(state: AppState): string {
  const theme = getActiveTheme(state);
  const scoped = state.alumni.filter(
    (a) =>
      state.activeWorkspace === 'all' ||
      a.credentials.some((c) => c.institutionId === state.activeWorkspace)
  );

  const batches = Array.from(new Set(scoped.flatMap((a) => a.credentials.map((c) => c.batchYear)))).sort(
    (a, b) => b - a
  );
  const depts = Array.from(new Set(scoped.flatMap((a) => a.credentials.map((c) => c.department)))).sort();
  const cities = Array.from(new Set(scoped.map((a) => a.city))).sort();
  const industries = Array.from(new Set(scoped.map((a) => a.industry))).sort();
  const companies = Array.from(new Set(scoped.map((a) => a.company))).sort();

  const q = state.dirQuery.trim().toLowerCase();
  const filtered = scoped.filter((a) => {
    if (
      q &&
      !a.name.toLowerCase().includes(q) &&
      !a.company.toLowerCase().includes(q) &&
      !a.role.toLowerCase().includes(q) &&
      !a.city.toLowerCase().includes(q)
    )
      return false;
    if (state.dirBatch !== 'all' && !a.credentials.some((c) => String(c.batchYear) === state.dirBatch))
      return false;
    if (state.dirDept !== 'all' && !a.credentials.some((c) => c.department === state.dirDept))
      return false;
    if (state.dirCity !== 'all' && a.city !== state.dirCity) return false;
    if (state.dirIndustry !== 'all' && a.industry !== state.dirIndustry) return false;
    if (state.dirCompany !== 'all' && a.company !== state.dirCompany) return false;
    if (state.dirOpenTo.length > 0 && !state.dirOpenTo.every((tag) => a.openTo.includes(tag)))
      return false;
    return true;
  });

  const clustersMap: Record<string, Alumnus[]> = {};
  for (const a of filtered) {
    if (!clustersMap[a.city]) clustersMap[a.city] = [];
    clustersMap[a.city].push(a);
  }
  const cityClusters = Object.entries(clustersMap).sort((a, b) => b[1].length - a[1].length);

  const activeFiltersCount =
    (state.dirBatch !== 'all' ? 1 : 0) +
    (state.dirDept !== 'all' ? 1 : 0) +
    (state.dirCity !== 'all' ? 1 : 0) +
    (state.dirIndustry !== 'all' ? 1 : 0) +
    (state.dirCompany !== 'all' ? 1 : 0) +
    state.dirOpenTo.length;

  const formatCreds = (alum: Alumnus) =>
    alum.credentials
      .map((c) => {
        const inst = state.institutions.find((i) => i.id === c.institutionId);
        return `${inst?.shortName ?? c.institutionId} ’${String(c.batchYear).slice(-2)}`;
      })
      .join(' · ');

  return `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Smart Alumni Directory</h1>
          <p class="text-sm text-stone-500 mt-0.5 tabular-nums">Showing ${filtered.length} verified alumni across ${cityClusters.length} global hubs</p>
        </div>
        <div class="inline-flex items-center p-1 rounded-xl bg-stone-200/70 border border-stone-200 self-start sm:self-auto">
          <button type="button" data-action="set-dir-view" data-value="grid"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              state.dirViewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }">${icon('grid', 'w-3.5 h-3.5')} Grid View</button>
          <button type="button" data-action="set-dir-view" data-value="map"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              state.dirViewMode === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }">${icon('mapPin', 'w-3.5 h-3.5')} City Cluster View</button>
        </div>
      </div>

      <!-- Multi-Select Filter Bar -->
      <div class="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-3.5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div class="relative lg:col-span-2">
            <span class="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">${icon('search', 'w-3.5 h-3.5')}</span>
            <input type="text" data-input="dirQuery" value="${esc(state.dirQuery)}"
              placeholder="Filter by name, role, company..."
              class="w-full h-9 pl-8.5 pr-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
          </div>

          <select data-select="dirBatch" class="h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-700">
            <option value="all">All Batches</option>
            ${batches.map((b) => `<option value="${b}" ${state.dirBatch === String(b) ? 'selected' : ''}>Class of ${b}</option>`).join('')}
          </select>

          <select data-select="dirDept" class="h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-700">
            <option value="all">All Departments</option>
            ${depts.map((d) => `<option value="${esc(d)}" ${state.dirDept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
          </select>

          <select data-select="dirCity" class="h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-700">
            <option value="all">All Cities</option>
            ${cities.map((c) => `<option value="${esc(c)}" ${state.dirCity === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>

          <select data-select="dirIndustry" class="h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-700">
            <option value="all">All Industries</option>
            ${industries.map((ind) => `<option value="${esc(ind)}" ${state.dirIndustry === ind ? 'selected' : ''}>${esc(ind)}</option>`).join('')}
          </select>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-stone-100">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1 text-xs font-medium text-stone-500">${icon('sliders', 'w-3.5 h-3.5')} Open to:</span>
            ${OPEN_TO_OPTIONS.map((tag) => {
              const active = state.dirOpenTo.includes(tag);
              return `<button type="button" data-action="toggle-dir-opento" data-value="${esc(tag)}"
                class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  active ? 'text-white border-transparent' : 'border-stone-200 text-stone-600 hover:border-stone-300 bg-white'
                }" ${active ? `style="background-color:${esc(theme.primary)}"` : ''}>${esc(tag)}</button>`;
            }).join('')}

            <select data-select="dirCompany" class="h-7.5 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-700">
              <option value="all">Any Company</option>
              ${companies.map((c) => `<option value="${esc(c)}" ${state.dirCompany === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
          </div>

          ${
            activeFiltersCount > 0
              ? `<button type="button" data-action="reset-dir-filters" class="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900">
                  ${icon('rotate', 'w-3 h-3')} Reset (${activeFiltersCount})
                </button>`
              : ''
          }
        </div>
      </div>

      ${
        filtered.length === 0
          ? emptyState(
              'No alumni match your filters',
              'Broaden your batch year, city, or Open To criteria to discover more verified alumni.',
              'data-action="reset-dir-filters"',
              'Clear All Filters'
            )
          : state.dirViewMode === 'grid'
          ? `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              ${filtered
                .map(
                  (alum) => `
                <div class="bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors">
                  <div class="space-y-3">
                    <button type="button" data-action="open-profile" data-id="${esc(alum.id)}" class="flex items-start gap-3 text-left min-w-0 group w-full">
                      ${renderAvatar({ name: alum.name, initials: alum.initials, tone: alum.avatarTone, size: 'md' })}
                      <div class="min-w-0">
                        <h3 class="text-sm font-semibold text-stone-900 group-hover:underline truncate">${esc(alum.name)}</h3>
                        <p class="text-xs text-stone-600 truncate mt-0.5">${esc(alum.role)} · <span class="font-semibold text-stone-800">${esc(
                    alum.company
                  )}</span></p>
                        <p class="text-[11px] text-stone-500 truncate mt-0.5">${esc(formatCreds(alum))}</p>
                      </div>
                    </button>
                    <p class="text-xs text-stone-600 line-clamp-2 leading-relaxed">${esc(alum.bio)}</p>
                    <div class="text-[11px] text-stone-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span>${esc(alum.city)}</span>
                      <span aria-hidden="true">·</span>
                      <span>${esc(alum.industry)}</span>
                      ${
                        alum.openTo.length > 0
                          ? `<span aria-hidden="true">·</span><span class="font-semibold" style="color:${esc(
                              theme.primary
                            )}">${esc(alum.openTo.join(' / '))}</span>`
                          : ''
                      }
                    </div>
                  </div>
                  <div class="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button type="button" data-action="open-profile" data-id="${esc(
                      alum.id
                    )}" class="text-xs font-semibold text-stone-700 hover:text-stone-900">View Profile</button>
                    <button type="button" data-action="toggle-connect" data-id="${esc(alum.id)}"
                      class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                      style="${
                        alum.connected || alum.connectionPending
                          ? 'background-color:#F5F5F4;color:#44403C'
                          : `background-color:${esc(theme.primary)};color:#FFFFFF`
                      }">
                      ${alum.connected ? 'Connected' : alum.connectionPending ? 'Requested' : 'Connect'}
                    </button>
                  </div>
                </div>`
                )
                .join('')}
            </div>`
          : `<div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div class="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-sm font-semibold text-stone-900">Global Alumni City Clusters</h2>
                    <p class="text-xs text-stone-500 mt-0.5">Select any hub pin to filter the alumni roster on the right</p>
                  </div>
                  ${
                    state.dirMapCity
                      ? `<button type="button" data-action="set-map-city" data-value="" class="text-xs font-semibold text-stone-600 hover:text-stone-900">Show all hubs</button>`
                      : ''
                  }
                </div>
                <div class="relative w-full aspect-[16/9] rounded-xl bg-stone-900 overflow-hidden border border-stone-800">
                  <svg viewBox="0 0 100 56" class="w-full h-full" aria-label="Global alumni distribution map">
                    <line x1="0" y1="14" x2="100" y2="14" stroke="#292524" stroke-width="0.3"/>
                    <line x1="0" y1="28" x2="100" y2="28" stroke="#292524" stroke-width="0.3"/>
                    <line x1="0" y1="42" x2="100" y2="42" stroke="#292524" stroke-width="0.3"/>
                    <line x1="20" y1="0" x2="20" y2="56" stroke="#292524" stroke-width="0.3"/>
                    <line x1="40" y1="0" x2="40" y2="56" stroke="#292524" stroke-width="0.3"/>
                    <line x1="60" y1="0" x2="60" y2="56" stroke="#292524" stroke-width="0.3"/>
                    <line x1="80" y1="0" x2="80" y2="56" stroke="#292524" stroke-width="0.3"/>
                    <path d="M8,16 L25,14 L29,24 L21,31 L14,27 Z M39,13 L53,12 L56,22 L44,24 Z M54,23 L72,22 L78,35 L68,45 L58,41 Z M75,37 L87,38 L85,46 L76,45 Z" fill="#292524"/>
                  </svg>
                  ${cityClusters
                    .map(([city, members]) => {
                      const pos = CITY_COORDS[city] ?? { x: 50, y: 50 };
                      const active = state.dirMapCity === city;
                      return `
                        <button type="button" data-action="set-map-city" data-value="${esc(active ? '' : city)}"
                          class="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-md border transition-transform flex items-center gap-1.5 whitespace-nowrap ${
                            active
                              ? 'scale-110 text-white border-white'
                              : 'bg-white text-stone-900 border-stone-200 hover:scale-105'
                          }" style="left:${pos.x}%;top:${pos.y}%;${
                        active ? `background-color:${esc(theme.primary)}` : ''
                      }">
                          <span>${esc(city === 'San Francisco Bay Area' ? 'Bay Area' : city)}</span>
                          <span class="font-mono tabular-nums opacity-75">${members.length}</span>
                        </button>`;
                    })
                    .join('')}
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  ${cityClusters
                    .slice(0, 4)
                    .map(
                      ([city, members]) => `
                    <button type="button" data-action="set-map-city" data-value="${esc(
                      state.dirMapCity === city ? '' : city
                    )}" class="p-3 rounded-xl border text-left transition-colors ${
                        state.dirMapCity === city
                          ? 'border-stone-900 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }">
                      <div class="text-lg font-bold font-mono text-stone-900 tabular-nums">${members.length}</div>
                      <div class="text-xs font-medium text-stone-700 truncate">${esc(city)}</div>
                    </button>`
                    )
                    .join('')}
                </div>
              </div>

              <div class="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                ${cityClusters
                  .filter(([city]) => !state.dirMapCity || city === state.dirMapCity)
                  .map(
                    ([city, members]) => `
                  <div class="p-4 space-y-2.5">
                    <div class="flex items-center justify-between">
                      <h3 class="text-xs font-semibold text-stone-900">${esc(city)}</h3>
                      <span class="text-xs font-mono text-stone-500 tabular-nums">${members.length} alumni</span>
                    </div>
                    <div class="space-y-1">
                      ${members
                        .map(
                          (alum) => `
                        <button type="button" data-action="open-profile" data-id="${esc(alum.id)}"
                          class="w-full flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg hover:bg-stone-50 text-left transition-colors">
                          <div class="flex items-center gap-2.5 min-w-0">
                            ${renderAvatar({ name: alum.name, initials: alum.initials, tone: alum.avatarTone, size: 'sm' })}
                            <div class="min-w-0">
                              <div class="text-xs font-semibold text-stone-900 truncate">${esc(alum.name)}</div>
                              <div class="text-[11px] text-stone-500 truncate">${esc(alum.role)} · ${esc(alum.company)}</div>
                            </div>
                          </div>
                          <span class="text-[11px] font-medium text-stone-400 shrink-0">Profile</span>
                        </button>`
                        )
                        .join('')}
                    </div>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>`
      }
    </div>
  `;
}

// ============================================================================
// 3. CHAPTERS & BATCH GROUPS VIEW
// ============================================================================
export function renderGroupsView(state: AppState): string {
  const theme = getActiveTheme(state);
  const selectedGroup = state.groups.find((g) => g.id === state.selectedGroupId) ?? null;

  if (selectedGroup) {
    const inst = state.institutions.find((i) => i.id === selectedGroup.institutionId);
    const members = state.alumni.filter((a) => selectedGroup.featuredMemberIds.includes(a.id));

    return `
      <div class="space-y-5">
        <button type="button" data-action="close-group"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900">
          ${icon('arrowLeft', 'w-3.5 h-3.5')} Back to Chapters & Batch Groups
        </button>

        <div class="bg-white border border-stone-200/90 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="space-y-1.5 max-w-2xl">
            <div class="text-xs text-stone-500">${esc(
              inst ? inst.name : 'Multi-Campus Chapter'
            )} · ${esc(selectedGroup.locationOrYear)} · <span class="font-mono tabular-nums">${selectedGroup.memberCount.toLocaleString(
      'en-IN'
    )} members</span></div>
            <h1 class="font-editorial text-2xl font-semibold text-stone-900">${esc(selectedGroup.name)}</h1>
            <p class="text-sm text-stone-600 leading-relaxed">${esc(selectedGroup.description)}</p>
            <div class="text-xs text-stone-500 pt-1">Chapter Lead: <span class="font-semibold text-stone-800">${esc(
              selectedGroup.leadName
            )}</span> · ${esc(selectedGroup.recentActivity)}</div>
          </div>
          <button type="button" data-action="toggle-join-group" data-id="${esc(selectedGroup.id)}"
            class="px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            style="${
              selectedGroup.joined
                ? 'background-color:#F5F5F4;color:#1C1917'
                : `background-color:${esc(theme.primary)};color:#FFFFFF`
            }">
            ${selectedGroup.joined ? 'Joined Group' : 'Join Group'}
          </button>
        </div>

        <div class="flex items-center gap-1 border-b border-stone-200/80 pb-2.5">
          ${(
            [
              { id: 'feed', label: `Group Feed (${selectedGroup.posts.length})` },
              { id: 'members', label: `Members (${members.length})` },
              { id: 'discussions', label: `Discussions (${selectedGroup.discussions.length})` },
            ] as const
          )
            .map(
              (tab) => `
            <button type="button" data-action="set-group-subtab" data-value="${tab.id}"
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                state.groupSubTab === tab.id
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }">${tab.label}</button>`
            )
            .join('')}
        </div>

        ${
          state.groupSubTab === 'feed'
            ? `<div class="space-y-4 max-w-3xl">
                <form data-form="group-post" data-group-id="${esc(selectedGroup.id)}"
                  class="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-3">
                  <textarea name="content" rows="2" required placeholder="Share an update with ${esc(
                    selectedGroup.name
                  )}..." class="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400 resize-none"></textarea>
                  <div class="flex justify-end">
                    <button type="submit" class="px-4 py-1.5 rounded-lg text-xs font-semibold text-white" style="background-color:${esc(
                      theme.primary
                    )}">Post to Group</button>
                  </div>
                </form>
                ${
                  selectedGroup.posts.length === 0
                    ? emptyState('No updates yet', 'Start the conversation by posting above.')
                    : selectedGroup.posts
                        .map(
                          (msg) => `
                      <div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-2.5">
                        <div class="flex items-center gap-3">
                          ${renderAvatar({
                            name: msg.authorName,
                            initials: msg.authorInitials,
                            tone: msg.authorTone,
                            size: 'sm',
                          })}
                          <div>
                            <div class="text-xs font-semibold text-stone-900">${esc(
                              msg.authorName
                            )} <span class="font-normal text-stone-400">· ${esc(msg.timestamp)}</span></div>
                            <div class="text-[11px] text-stone-500">${esc(msg.authorRole)}</div>
                          </div>
                        </div>
                        <p class="text-sm text-stone-700 leading-relaxed">${esc(msg.content)}</p>
                      </div>`
                        )
                        .join('')
                }
              </div>`
            : state.groupSubTab === 'members'
            ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${members
                  .map(
                    (m) => `
                  <button type="button" data-action="open-profile" data-id="${esc(m.id)}"
                    class="bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl p-4 flex items-center gap-3 text-left transition-colors">
                    ${renderAvatar({ name: m.name, initials: m.initials, tone: m.avatarTone, size: 'md' })}
                    <div class="min-w-0">
                      <div class="text-sm font-semibold text-stone-900 truncate">${esc(m.name)}</div>
                      <div class="text-xs text-stone-600 truncate">${esc(m.role)} · ${esc(m.company)}</div>
                      <div class="text-[11px] text-stone-400 truncate mt-0.5">${esc(m.city)}</div>
                    </div>
                  </button>`
                  )
                  .join('')}
              </div>`
            : `<div class="space-y-4 max-w-3xl">
                ${
                  selectedGroup.discussions.length === 0
                    ? emptyState('No discussion threads yet', 'Start a topic in the Group Feed.')
                    : selectedGroup.discussions
                        .map(
                          (disc) => `
                      <div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
                        <div>
                          <h3 class="text-sm font-semibold text-stone-900">${esc(disc.title)}</h3>
                          <p class="text-xs text-stone-500 mt-0.5">Started by ${esc(disc.startedBy)} · ${esc(
                            disc.timestamp
                          )} · ${disc.replies.length} replies</p>
                        </div>
                        <div class="space-y-2.5 pl-4 border-l border-stone-200">
                          ${disc.replies
                            .map(
                              (rep) => `
                            <div class="text-xs space-y-0.5">
                              <div class="font-semibold text-stone-900">${esc(
                                rep.authorName
                              )} <span class="font-normal text-stone-400">· ${esc(rep.timestamp)}</span></div>
                              <p class="text-stone-700 leading-relaxed">${esc(rep.content)}</p>
                            </div>`
                            )
                            .join('')}
                        </div>
                        <form data-form="group-reply" data-group-id="${esc(
                          selectedGroup.id
                        )}" data-discussion-id="${esc(disc.id)}" class="flex items-center gap-2 pt-2 border-t border-stone-100">
                          <input type="text" name="reply" required placeholder="Add your reply..."
                            class="flex-1 h-8.5 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
                          <button type="submit" class="h-8.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1">
                            ${icon('send', 'w-3 h-3')} Reply
                          </button>
                        </form>
                      </div>`
                        )
                        .join('')
                }
              </div>`
        }
      </div>
    `;
  }

  const visibleGroups = state.groups.filter((g) => {
    const wsOk =
      state.activeWorkspace === 'all' ||
      g.institutionId === state.activeWorkspace ||
      g.institutionId === 'all';
    return wsOk && g.category === state.groupTab;
  });

  return `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Chapters & Batch Groups</h1>
          <p class="text-sm text-stone-500 mt-0.5">Dedicated cohort circles, global city chapters, and alumni societies</p>
        </div>
        <div class="inline-flex items-center p-1 rounded-xl bg-stone-200/70 border border-stone-200 self-start sm:self-auto">
          ${(
            [
              { id: 'batch', label: 'My Batch Groups' },
              { id: 'regional', label: 'Regional Chapters' },
              { id: 'club', label: 'Clubs & Societies' },
            ] as const
          )
            .map(
              (tab) => `
            <button type="button" data-action="set-group-tab" data-value="${tab.id}"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                state.groupTab === tab.id ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }">${tab.label}</button>`
            )
            .join('')}
        </div>
      </div>

      ${
        visibleGroups.length === 0
          ? emptyState(
              'No groups in this category for the active campus',
              'Switch to All Alma Maters or explore Regional Chapters.',
              'data-action="set-group-tab" data-value="regional"',
              'View Regional Chapters'
            )
          : `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${visibleGroups
                .map((group) => {
                  const inst = state.institutions.find((i) => i.id === group.institutionId);
                  return `
                    <div class="bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors">
                      <div class="space-y-2">
                        <div class="flex items-center justify-between gap-2 text-xs text-stone-500">
                          <span>${esc(inst ? inst.shortName : 'Multi-Campus')} · ${esc(group.locationOrYear)}</span>
                          <span class="tabular-nums">${esc(group.recentActivity)}</span>
                        </div>
                        <button type="button" data-action="open-group" data-id="${esc(group.id)}" class="text-left group">
                          <h3 class="font-editorial text-lg font-semibold text-stone-900 group-hover:underline">${esc(group.name)}</h3>
                        </button>
                        <p class="text-xs text-stone-600 leading-relaxed">${esc(group.description)}</p>
                      </div>
                      <div class="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 text-xs text-stone-500 tabular-nums">
                          <span class="inline-flex items-center gap-1">${icon('users', 'w-3.5 h-3.5')} ${group.memberCount.toLocaleString(
                    'en-IN'
                  )}</span>
                          <span class="inline-flex items-center gap-1">${icon('message', 'w-3.5 h-3.5')} ${
                    group.posts.length + group.discussions.length
                  } threads</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <button type="button" data-action="toggle-join-group" data-id="${esc(group.id)}"
                            class="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 whitespace-nowrap">
                            ${group.joined ? 'Joined' : 'Join'}
                          </button>
                          <button type="button" data-action="open-group" data-id="${esc(group.id)}"
                            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap"
                            style="background-color:${esc(theme.primary)}">Open Space</button>
                        </div>
                      </div>
                    </div>`;
                })
                .join('')}
            </div>`
      }
    </div>
  `;
}

// ============================================================================
// 4. JOBS & REFERRALS BOARD VIEW
// ============================================================================
export function renderJobsView(state: AppState): string {
  const theme = getActiveTheme(state);
  const q = state.jobQuery.trim().toLowerCase();
  const visibleJobs = state.jobs.filter((job) => {
    const wsOk = state.activeWorkspace === 'all' || job.institutionId === state.activeWorkspace;
    const qOk =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q);
    const typeOk = state.jobType === 'all' || job.employmentType === state.jobType;
    const refOk = !state.jobReferralOnly || job.directReferral;
    return wsOk && qOk && typeOk && refOk;
  });

  const selectedJob = state.jobs.find((j) => j.id === state.selectedJobId) ?? null;

  return `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Jobs & Alumni Referrals</h1>
          <p class="text-sm text-stone-500 mt-0.5 tabular-nums">${visibleJobs.length} roles posted directly by verified alumni</p>
        </div>
        <button type="button" data-action="open-post-job"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap self-start sm:self-auto"
          style="background-color:${esc(theme.primary)}">
          ${icon('plus', 'w-3.5 h-3.5')} Post a Job
        </button>
      </div>

      <div class="bg-white border border-stone-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
          <div class="relative flex-1 min-w-[200px] max-w-sm">
            <span class="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">${icon('search', 'w-3.5 h-3.5')}</span>
            <input type="text" data-input="jobQuery" value="${esc(state.jobQuery)}"
              placeholder="Search role, company, or city..."
              class="w-full h-9 pl-8.5 pr-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
          </div>
          <div class="inline-flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg border border-stone-200/70">
            ${['all', 'Full-time', 'Founding Team', 'Leadership']
              .map(
                (t) => `
              <button type="button" data-action="set-job-type" data-value="${t}"
                class="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  state.jobType === t ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }">${t === 'all' ? 'All Roles' : t}</button>`
              )
              .join('')}
          </div>
        </div>
        <label class="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer whitespace-nowrap">
          <input type="checkbox" data-checkbox="jobReferralOnly" ${
            state.jobReferralOnly ? 'checked' : ''
          } class="rounded border-stone-300" />
          Direct Referral Available only
        </label>
      </div>

      ${
        visibleJobs.length === 0
          ? emptyState(
              'No roles match your filters',
              'Reset search or role type filters to view all openings.',
              'data-action="reset-job-filters"',
              'Reset Filters'
            )
          : `<div class="bg-white border border-stone-200/90 rounded-2xl divide-y divide-stone-100">
              ${visibleJobs
                .map((job) => {
                  const inst = state.institutions.find((i) => i.id === job.institutionId);
                  const poster = state.alumni.find((a) => a.id === job.postedById);
                  return `
                    <div class="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors">
                      <div class="space-y-1.5 min-w-0">
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                          <span class="font-semibold text-stone-900">${esc(job.company)}</span>
                          <span aria-hidden="true">·</span>
                          <span>${esc(job.employmentType)}</span>
                          <span aria-hidden="true">·</span>
                          <span>${esc(inst?.shortName ?? 'Alumni Network')}</span>
                          ${
                            job.directReferral
                              ? `<span aria-hidden="true">·</span><span class="font-semibold text-emerald-700">Direct Referral Available</span>`
                              : ''
                          }
                        </div>
                        <button type="button" data-action="open-job-detail" data-id="${esc(job.id)}" class="text-left group">
                          <h3 class="text-base font-semibold text-stone-900 group-hover:underline">${esc(job.title)}</h3>
                        </button>
                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                          <span class="inline-flex items-center gap-1">${icon('mapPin', 'w-3.5 h-3.5 text-stone-400')} ${esc(
                    job.location
                  )} (${esc(job.workMode)})</span>
                          <span class="inline-flex items-center gap-1 font-mono tabular-nums">${icon(
                            'briefcase',
                            'w-3.5 h-3.5 text-stone-400'
                          )} ${esc(job.experienceLevel)}</span>
                          <span class="font-mono font-semibold text-stone-900 tabular-nums">${esc(job.compensation)}</span>
                        </div>
                        <div class="text-[11px] text-stone-500 pt-0.5">
                          Posted by <button type="button" ${
                            poster ? `data-action="open-profile" data-id="${esc(poster.id)}"` : ''
                          } class="font-semibold text-stone-800 ${poster ? 'hover:underline' : ''}">${esc(
                    job.postedByName
                  )}</button> (${esc(job.postedByBatch)}) · ${esc(job.postedAt)} · <span class="tabular-nums">${
                    job.applicantsCount
                  } applicants</span>
                        </div>
                      </div>
                      <div class="shrink-0">
                        ${
                          job.referralRequested
                            ? `<span class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 whitespace-nowrap">${icon(
                                'check',
                                'w-3.5 h-3.5'
                              )} Referral Requested</span>`
                            : `<button type="button" data-action="open-job-detail" data-id="${esc(job.id)}"
                                class="px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap"
                                style="background-color:${esc(theme.primary)}">
                                ${job.directReferral ? 'View & Request Referral' : 'View Details'}
                              </button>`
                        }
                      </div>
                    </div>`;
                })
                .join('')}
            </div>`
      }

      ${
        selectedJob
          ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-[2px] p-4 overflow-y-auto" data-action="close-job-detail">
              <div class="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-auto" data-stop-prop="true">
                <div class="flex items-start justify-between gap-4 px-6 py-4 border-b border-stone-100">
                  <div>
                    <h2 class="text-base font-semibold text-stone-900">${esc(selectedJob.title)}</h2>
                    <p class="text-xs text-stone-500 mt-0.5">${esc(selectedJob.company)} · ${esc(
              selectedJob.location
            )} · ${esc(selectedJob.compensation)}</p>
                  </div>
                  <button type="button" data-action="close-job-detail" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                    'x',
                    'w-4 h-4'
                  )}</button>
                </div>
                <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                  <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between gap-2">
                    <div>
                      <div class="font-semibold text-stone-900">Posted by ${esc(selectedJob.postedByName)}</div>
                      <div class="text-stone-500 mt-0.5">${esc(selectedJob.postedByRole)} · ${esc(
              selectedJob.postedByBatch
            )}</div>
                    </div>
                    ${
                      selectedJob.directReferral
                        ? `<span class="font-semibold text-emerald-700 shrink-0">Direct Referral Eligible</span>`
                        : ''
                    }
                  </div>
                  <div class="space-y-1.5">
                    <h4 class="text-xs font-semibold text-stone-900">Role Overview</h4>
                    <p class="text-sm text-stone-700 leading-relaxed">${esc(selectedJob.description)}</p>
                  </div>
                  <div class="space-y-1.5">
                    <h4 class="text-xs font-semibold text-stone-900">Requirements</h4>
                    <ul class="list-disc pl-5 space-y-1 text-xs text-stone-700">
                      ${selectedJob.requirements.map((r) => `<li>${esc(r)}</li>`).join('')}
                    </ul>
                  </div>
                  <form data-form="request-referral" data-job-id="${esc(
                    selectedJob.id
                  )}" class="space-y-3 pt-4 border-t border-stone-100">
                    <h4 class="text-xs font-semibold text-stone-900">Request Direct Referral from ${esc(
                      selectedJob.postedByName
                    )}</h4>
                    <div>
                      <label class="block text-xs text-stone-600 mb-1">Resume / Portfolio PDF</label>
                      <input type="text" name="resume" value="Rohan_Sharma_Product_Resume_2026.pdf"
                        class="w-full h-9 px-3 rounded-lg border border-stone-200 font-mono text-xs" />
                    </div>
                    <div>
                      <label class="block text-xs text-stone-600 mb-1">Personal Note</label>
                      <textarea name="note" rows="3" required placeholder="Highlight relevant experience and shared campus context..."
                        class="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs resize-none"></textarea>
                    </div>
                    <div class="flex justify-end gap-2">
                      <button type="button" data-action="close-job-detail" class="px-4 py-2 text-xs font-medium text-stone-600">Cancel</button>
                      <button type="submit" class="px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background-color:${esc(
                        theme.primary
                      )}">Submit Referral Request</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>`
          : ''
      }

      ${
        state.postJobModalOpen
          ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-[2px] p-4 overflow-y-auto" data-action="close-post-job">
              <div class="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-auto" data-stop-prop="true">
                <div class="flex items-start justify-between gap-4 px-6 py-4 border-b border-stone-100">
                  <div>
                    <h2 class="text-base font-semibold text-stone-900">Post an Alumni Job Opening</h2>
                    <p class="text-xs text-stone-500 mt-0.5">Share a role on your team and offer direct internal referrals.</p>
                  </div>
                  <button type="button" data-action="close-post-job" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                    'x',
                    'w-4 h-4'
                  )}</button>
                </div>
                <form data-form="post-job" class="p-6 space-y-3.5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Job Title</label>
                      <input type="text" name="title" required placeholder="e.g., Staff Product Designer" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Company</label>
                      <input type="text" name="company" required value="Razorpay" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Location</label>
                      <input type="text" name="location" value="Bengaluru, India" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Work Mode</label>
                      <select name="workMode" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Role Type</label>
                      <select name="employmentType" class="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs">
                        <option value="Full-time">Full-time</option>
                        <option value="Founding Team">Founding Team</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Advisory">Advisory</option>
                      </select>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Compensation</label>
                      <input type="text" name="compensation" value="₹45L – ₹62L + ESOPs" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-mono" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-700 mb-1">Experience</label>
                      <input type="text" name="experienceLevel" value="4–7 years" class="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs" />
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
                  <div>
                    <label class="block text-xs font-medium text-stone-700 mb-1">Role Description</label>
                    <textarea name="description" rows="3" required placeholder="Describe responsibilities and team impact..." class="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs resize-none"></textarea>
                  </div>
                  <label class="flex items-center gap-2 text-xs text-stone-700">
                    <input type="checkbox" name="directReferral" checked class="rounded border-stone-300" />
                    Direct Referral Available (accept referral notes directly)
                  </label>
                  <div class="flex justify-end gap-2 pt-2">
                    <button type="button" data-action="close-post-job" class="px-4 py-2 text-xs font-medium text-stone-600">Cancel</button>
                    <button type="submit" class="px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background-color:${esc(
                      theme.primary
                    )}">Publish Job Listing</button>
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
// 5. MENTORSHIP HUB VIEW
// ============================================================================
export function renderMentorshipView(state: AppState): string {
  const theme = getActiveTheme(state);
  const filteredMentors = state.mentors.filter((m) => {
    const wsOk = state.activeWorkspace === 'all' || m.institutionId === state.activeWorkspace;
    const expOk =
      state.mentorExpertise === 'All Topics' || m.expertise.includes(state.mentorExpertise);
    return wsOk && expOk;
  });

  const bookingMentor = state.mentors.find((m) => m.id === state.bookingMentorId) ?? null;

  return `
    <div class="space-y-6">
      <div>
        <h1 class="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">Mentorship Hub</h1>
        <p class="text-sm text-stone-500 mt-0.5">Book 30-minute career, admissions, and fundraising guidance with verified alumni mentors</p>
      </div>

      ${
        state.bookedSessions.length > 0
          ? `<div class="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-xs font-semibold text-stone-900">Your Confirmed Upcoming Sessions (${state.bookedSessions.length})</h2>
                <span class="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">${icon(
                  'check',
                  'w-3.5 h-3.5'
                )} Calendar Sync Active</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${state.bookedSessions
                  .map(
                    (sess) => `
                  <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-xs font-semibold text-stone-900 truncate">${esc(sess.mentorName)} · ${esc(
                      sess.topic
                    )}</div>
                      <div class="text-[11px] text-stone-500 truncate mt-0.5">${esc(sess.mentorRole)}</div>
                    </div>
                    <div class="text-right shrink-0 font-mono tabular-nums">
                      <div class="text-xs font-semibold text-stone-900">${esc(sess.dateLabel)}</div>
                      <div class="text-[11px] text-stone-500">${esc(sess.timeLabel)}</div>
                    </div>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>`
          : ''
      }

      <div class="flex flex-wrap items-center gap-1.5">
        ${EXPERTISE_FILTERS.map(
          (exp) => `
          <button type="button" data-action="set-mentor-exp" data-value="${esc(exp)}"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
              state.mentorExpertise === exp
                ? 'text-white border-transparent'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }" ${state.mentorExpertise === exp ? `style="background-color:${esc(theme.primary)}"` : ''}>${esc(
            exp
          )}</button>`
        ).join('')}
      </div>

      ${
        filteredMentors.length === 0
          ? emptyState(
              'No mentors match this expertise filter',
              'Select All Topics or switch to All Alma Maters.',
              'data-action="set-mentor-exp" data-value="All Topics"',
              'Show All Topics'
            )
          : `<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              ${filteredMentors
                .map((mentor) => {
                  const openSlots = mentor.slots.filter((s) => !s.booked);
                  return `
                    <div class="bg-white border border-stone-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4">
                      <div class="space-y-3">
                        <button type="button" data-action="open-profile" data-id="${esc(
                          mentor.alumnusId
                        )}" class="flex items-start gap-3 text-left group min-w-0">
                          ${renderAvatar({
                            name: mentor.name,
                            initials: mentor.initials,
                            tone: mentor.avatarTone,
                            size: 'lg',
                          })}
                          <div class="min-w-0">
                            <h3 class="text-sm font-semibold text-stone-900 group-hover:underline truncate">${esc(
                              mentor.name
                            )}</h3>
                            <p class="text-xs text-stone-700 truncate">${esc(mentor.role)} · <span class="font-semibold">${esc(
                    mentor.company
                  )}</span></p>
                            <p class="text-[11px] text-stone-500 mt-0.5">${esc(
                              mentor.credentialLabel
                            )} · <span class="tabular-nums">${mentor.sessionsCompleted} sessions</span></p>
                          </div>
                        </button>
                        <p class="text-xs text-stone-600 leading-relaxed">${esc(mentor.bio)}</p>
                        <div class="text-xs text-stone-500">
                          <span class="font-semibold text-stone-800">Focus areas: </span>${esc(
                            mentor.expertise.join(' · ')
                          )}
                        </div>
                        <div class="pt-1 space-y-2">
                          <div class="flex items-center justify-between text-[11px] text-stone-500">
                            <span class="font-semibold text-stone-700">Monthly 30-Min Slots</span>
                            <span>${esc(mentor.responseTime)}</span>
                          </div>
                          <div class="flex flex-wrap gap-2">
                            ${mentor.slots
                              .map(
                                (slot) => `
                              <button type="button" ${
                                slot.booked
                                  ? 'disabled'
                                  : `data-action="open-book-mentor" data-mentor-id="${esc(
                                      mentor.id
                                    )}" data-slot-id="${esc(slot.id)}"`
                              }
                                class="px-2.5 py-1.5 rounded-lg border text-xs font-mono tabular-nums whitespace-nowrap ${
                                  slot.booked
                                    ? 'border-stone-100 bg-stone-50 text-stone-400 line-through cursor-not-allowed'
                                    : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                                }">${esc(slot.dateLabel)} · ${esc(slot.timeLabel)}</button>`
                              )
                              .join('')}
                          </div>
                        </div>
                      </div>
                      <div class="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span class="text-xs text-stone-500 tabular-nums">${openSlots.length} open slots this month</span>
                        <button type="button" ${
                          openSlots.length === 0
                            ? 'disabled'
                            : `data-action="open-book-mentor" data-mentor-id="${esc(mentor.id)}" data-slot-id="${esc(
                                openSlots[0].id
                              )}"`
                        } class="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40 whitespace-nowrap"
                          style="background-color:${esc(theme.primary)}">
                          ${openSlots.length > 0 ? 'Schedule 30-Min Session' : 'Fully Booked'}
                        </button>
                      </div>
                    </div>`;
                })
                .join('')}
            </div>`
      }

      ${
        bookingMentor
          ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-[2px] p-4" data-action="close-book-mentor">
              <div class="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden" data-stop-prop="true">
                <div class="flex items-start justify-between px-6 py-4 border-b border-stone-100">
                  <div>
                    <h2 class="text-base font-semibold text-stone-900">Book 30-Min Session · ${esc(
                      bookingMentor.name
                    )}</h2>
                    <p class="text-xs text-stone-500 mt-0.5">${esc(bookingMentor.role)} at ${esc(
              bookingMentor.company
            )}</p>
                  </div>
                  <button type="button" data-action="close-book-mentor" class="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100">${icon(
                    'x',
                    'w-4 h-4'
                  )}</button>
                </div>
                <form data-form="book-mentor" data-mentor-id="${esc(bookingMentor.id)}" class="p-6 space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-stone-700 mb-2">Choose an available slot</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      ${bookingMentor.slots
                        .filter((s) => !s.booked)
                        .map(
                          (slot) => `
                        <button type="button" data-action="select-booking-slot" data-value="${esc(slot.id)}"
                          class="p-3 rounded-xl border text-left transition-colors ${
                            state.bookingSlotId === slot.id
                              ? 'border-stone-900 bg-stone-50'
                              : 'border-stone-200 hover:border-stone-300'
                          }">
                          <div class="flex items-center gap-1.5 text-xs font-semibold text-stone-900 font-mono tabular-nums">${icon(
                            'calendar',
                            'w-3.5 h-3.5 text-stone-500'
                          )} ${esc(slot.dateLabel)}</div>
                          <div class="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono tabular-nums mt-0.5">${icon(
                            'clock',
                            'w-3 h-3'
                          )} ${esc(slot.timeLabel)}</div>
                        </button>`
                        )
                        .join('')}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-stone-700 mb-1">Session Topic</label>
                    <select name="topic" class="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white text-xs">
                      ${bookingMentor.expertise.map((e) => `<option value="${esc(e)}">${esc(e)}</option>`).join('')}
                      <option value="General Career Strategy">General Career Strategy</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-stone-700 mb-1">Agenda & Questions</label>
                    <textarea name="notes" rows="3" placeholder="Share 2–3 specific questions ahead of the call..."
                      class="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs resize-none"></textarea>
                  </div>
                  <div class="flex justify-end gap-2 pt-1">
                    <button type="button" data-action="close-book-mentor" class="px-4 py-2 text-xs font-medium text-stone-600">Cancel</button>
                    <button type="submit" class="px-4 py-2 rounded-lg text-xs font-semibold text-white" style="background-color:${esc(
                      theme.primary
                    )}">Confirm 30-Min Booking</button>
                  </div>
                </form>
              </div>
            </div>`
          : ''
      }
    </div>
  `;
}
