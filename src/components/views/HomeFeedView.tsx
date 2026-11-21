import React, { useState } from 'react';
import {
  Bookmark,
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  Users,
} from 'lucide-react';
import {
  AlumniEvent,
  Alumnus,
  FeedPost,
  Institution,
  InstitutionTheme,
  NavSection,
  UserProfile,
  WorkspaceId,
} from '../../types/alumni';
import { UNIFIED_BANNER_URL } from '../../data/mockData';
import { AlumniAvatar, EmptyState, InstitutionCrest } from '../ui/CommonUI';

interface HomeFeedViewProps {
  activeWorkspace: WorkspaceId;
  activeInstitution: Institution | null;
  institutions: Institution[];
  theme: InstitutionTheme;
  user: UserProfile;
  posts: FeedPost[];
  alumni: Alumnus[];
  events: AlumniEvent[];
  onCreatePost: (payload: {
    institutionId: string;
    type: 'update' | 'question' | 'milestone';
    milestoneLabel?: string;
    title: string;
    content: string;
  }) => void;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onOpenAlumnus: (alumnus: Alumnus) => void;
  onNavigateSection: (section: NavSection) => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  activeWorkspace,
  activeInstitution,
  institutions,
  theme,
  user,
  posts,
  alumni,
  events,
  onCreatePost,
  onToggleLike,
  onToggleBookmark,
  onVotePoll,
  onAddComment,
  onOpenAlumnus,
  onNavigateSection,
}) => {
  const [composerType, setComposerType] = useState<'update' | 'question' | 'milestone'>('update');
  const [milestoneLabel, setMilestoneLabel] = useState('Career Promotion');
  const [targetInstId, setTargetInstId] = useState<string>(
    activeWorkspace === 'all' ? institutions[0]?.id ?? 'nit-warangal' : activeWorkspace
  );
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'announcement' | 'milestone' | 'poll'>('all');
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [bannerError, setBannerError] = useState(false);

  React.useEffect(() => {
    if (activeWorkspace !== 'all') {
      setTargetInstId(activeWorkspace);
    }
    setBannerError(false);
  }, [activeWorkspace]);

  const visiblePosts = posts.filter((p) => {
    const matchesWorkspace =
      activeWorkspace === 'all' || p.institutionId === activeWorkspace || p.institutionId === 'all';
    const matchesType = feedFilter === 'all' || p.type === feedFilter;
    return matchesWorkspace && matchesType;
  });

  const upcomingReunions = events
    .filter(
      (ev) =>
        (activeWorkspace === 'all' || ev.institutionId === activeWorkspace) &&
        (ev.category === 'Milestone Reunion' || ev.category === 'City Meetup')
    )
    .slice(0, 3);

  const nearbyAlumni = alumni
    .filter(
      (a) =>
        a.city === user.city &&
        (activeWorkspace === 'all' || a.credentials.some((c) => c.institutionId === activeWorkspace))
    )
    .slice(0, 4);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    onCreatePost({
      institutionId: activeWorkspace === 'all' ? targetInstId : activeWorkspace,
      type: composerType,
      milestoneLabel: composerType === 'milestone' ? milestoneLabel : undefined,
      title: postTitle.trim(),
      content: postContent.trim(),
    });
    setPostTitle('');
    setPostContent('');
  };

  const bannerSrc = activeInstitution ? activeInstitution.bannerUrl : UNIFIED_BANNER_URL;
  const totalVerifiedAcrossAll = institutions.reduce((sum, i) => sum + i.verifiedCount, 0);

  return (
    <div className="space-y-6">
      {/* Institutional Campus Banner */}
      <section className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[190px] sm:min-h-[210px] flex items-end">
        {!bannerError ? (
          <img
            src={bannerSrc}
            alt={activeInstitution ? `${activeInstitution.name} campus` : 'Unified alumni network campus'}
            referrerPolicy="no-referrer"
            onError={() => setBannerError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/15" />

        <div className="relative z-10 w-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-200/90">
              <span>
                {activeInstitution
                  ? `${activeInstitution.type} · ${activeInstitution.location}`
                  : `Unified Network · ${institutions.length} Verified Alma Maters`}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {activeInstitution
                  ? `Est. ${activeInstitution.foundedYear}`
                  : `${totalVerifiedAcrossAll.toLocaleString('en-IN')} Verified Alumni`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
              {activeInstitution ? activeInstitution.name : 'All Alma Maters — Unified Feed'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90">
              {activeInstitution
                ? `Verified as ${activeInstitution.userCredential.degree} · Class of ${activeInstitution.userCredential.batchYear} · Roll ${activeInstitution.userCredential.rollNumber}`
                : `${user.name} · ${institutions.map((i) => `${i.shortName} ’${String(i.userCredential.batchYear).slice(-2)}`).join(' · ')}`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateSection('id-card')}
              className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-xs border border-white/25 text-xs font-medium text-white transition-colors whitespace-nowrap"
            >
              View Alumni ID
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('directory')}
              className="px-3.5 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Explore Directory
            </button>
          </div>
        </div>
      </section>

      {/* Main 2-Column Feed + Right Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Primary Column */}
        <div className="xl:col-span-8 space-y-5">
          {/* Create Post Composer */}
          <form
            onSubmit={handlePublish}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <AlumniAvatar
                  name={user.name}
                  initials="RS"
                  avatarUrl={user.avatarUrl}
                  size="sm"
                />
                <span className="text-xs font-semibold text-slate-900">Share with your network</span>
              </div>

              {/* Composer Type Segmented Control */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                {(
                  [
                    { id: 'update', label: 'Update' },
                    { id: 'question', label: 'Question' },
                    { id: 'milestone', label: 'Milestone' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setComposerType(t.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      composerType === t.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {composerType === 'milestone' && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">Milestone type:</span>
                {['Career Promotion', 'Startup Launch', 'Higher Studies', 'Book / Award'].map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMilestoneLabel(m)}
                      className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                        milestoneLabel === m
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>
            )}

            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder={
                composerType === 'question'
                  ? 'Question headline (e.g., Looking for SaaS GTM advisors in Bengaluru)'
                  : composerType === 'milestone'
                  ? 'Milestone headline (e.g., Excited to share my new role...)'
                  : 'Optional headline...'
              }
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />

            <textarea
              rows={2}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write an update, ask classmates for advice, or celebrate a batch milestone..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Post to:</span>
                {activeWorkspace === 'all' ? (
                  <select
                    value={targetInstId}
                    onChange={(e) => setTargetInstId(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                  >
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-medium text-slate-800">{activeInstitution?.name}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={!postContent.trim()}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-colors whitespace-nowrap"
                style={{ backgroundColor: theme.primary }}
              >
                Publish Post
              </button>
            </div>
          </form>

          {/* Feed Filter Tabs */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'All Activity' },
                  { id: 'announcement', label: 'Campus Notices' },
                  { id: 'milestone', label: 'Milestones' },
                  { id: 'poll', label: 'Polls' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFeedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    feedFilter === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {visiblePosts.length} posts
            </span>
          </div>

          {/* Feed Stream */}
          {visiblePosts.length === 0 ? (
            <EmptyState
              title="No posts match this filter"
              description="Switch back to All Activity or share the first update for this campus."
              actionLabel="Show All Activity"
              onAction={() => setFeedFilter('all')}
            />
          ) : (
            <div className="space-y-4">
              {visiblePosts.map((post) => {
                const postInst = institutions.find((i) => i.id === post.institutionId);
                const totalPollVotes = post.poll
                  ? post.poll.options.reduce((sum, o) => sum + o.votes, 0)
                  : 0;
                const matchedAlum = alumni.find((a) => a.id === post.authorId);
                const commentsVisible = !!openComments[post.id];

                return (
                  <article
                    key={post.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5"
                  >
                    {/* Author & Quiet Unboxed Metadata */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => matchedAlum && onOpenAlumnus(matchedAlum)}
                          className={matchedAlum ? 'cursor-pointer' : 'cursor-default'}
                        >
                          <AlumniAvatar
                            name={post.authorName}
                            initials={post.authorInitials}
                            tone={post.authorTone}
                            avatarUrl={post.authorAvatarUrl}
                            size="md"
                          />
                        </button>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <button
                              type="button"
                              onClick={() => matchedAlum && onOpenAlumnus(matchedAlum)}
                              className={`text-sm font-semibold text-slate-900 truncate ${
                                matchedAlum ? 'hover:underline' : ''
                              }`}
                            >
                              {post.authorName}
                            </button>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500 tabular-nums">
                              {post.timestamp}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {post.authorRole} · {post.authorCredentialLabel}
                          </div>
                        </div>
                      </div>

                      {postInst && activeWorkspace === 'all' && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                          <InstitutionCrest
                            variant={postInst.crestVariant}
                            color={postInst.theme.primary}
                            size={15}
                          />
                          <span className="hidden sm:inline font-medium text-slate-700">
                            {postInst.shortName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Kicker line (clean unboxed text) */}
                    {(post.isOfficialBroadcast || post.milestoneLabel || post.type === 'question') && (
                      <div className="text-xs font-medium" style={{ color: postInst?.theme.primary ?? theme.primary }}>
                        {post.isOfficialBroadcast
                          ? `Campus Broadcast · ${post.broadcastSegment ?? 'Verified Alumni'}`
                          : post.milestoneLabel
                          ? `Milestone Spotlight · ${post.milestoneLabel}`
                          : 'Community Question'}
                      </div>
                    )}

                    {/* Title & Body */}
                    <div className="space-y-1.5">
                      {post.title && (
                        <h3 className="text-base font-semibold text-slate-900 leading-snug">
                          {post.title}
                        </h3>
                      )}
                      <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                    </div>

                    {/* Interactive Poll */}
                    {post.poll && (
                      <div className="pt-2 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">{post.poll.question}</span>
                          <span className="tabular-nums text-slate-500">
                            {totalPollVotes} votes · {post.poll.closesIn}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {post.poll.options.map((opt) => {
                            const pct =
                              totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
                            const isSelected = post.poll?.votedOptionId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => onVotePoll(post.id, opt.id)}
                                className={`w-full relative overflow-hidden rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                                  isSelected
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                              >
                                <div
                                  className="absolute inset-y-0 left-0 transition-all duration-300"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: isSelected
                                      ? `${postInst?.theme.primary ?? theme.primary}18`
                                      : '#F1F5F9',
                                  }}
                                />
                                <div className="relative flex items-center justify-between gap-3 text-xs">
                                  <span
                                    className={`font-medium ${
                                      isSelected ? 'text-slate-900' : 'text-slate-700'
                                    }`}
                                  >
                                    {opt.label}
                                    {isSelected ? ' (Your vote)' : ''}
                                  </span>
                                  <span className="font-mono font-semibold text-slate-700 tabular-nums shrink-0">
                                    {pct}%
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => onToggleLike(post.id)}
                          className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                            post.likedByMe ? 'text-rose-600' : 'hover:text-slate-900'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${post.likedByMe ? 'fill-rose-600' : ''}`}
                          />
                          <span className="tabular-nums">{post.likes}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                          }
                          className="inline-flex items-center gap-1.5 font-medium hover:text-slate-900 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="tabular-nums">
                            {post.comments.length} Comments
                          </span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleBookmark(post.id)}
                        className={`inline-flex items-center gap-1 font-medium transition-colors ${
                          post.bookmarked ? 'text-slate-900' : 'hover:text-slate-900'
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${post.bookmarked ? 'fill-slate-900' : ''}`}
                        />
                        {post.bookmarked ? 'Saved' : 'Save'}
                      </button>
                    </div>

                    {/* Comments Thread */}
                    {(commentsVisible || post.comments.length > 0) && commentsVisible && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        {post.comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5 text-xs">
                            <AlumniAvatar
                              name={c.authorName}
                              initials={c.authorInitials}
                              tone="#475569"
                              size="xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900">
                                  {c.authorName}
                                </span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-500">{c.authorMeta}</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-400 tabular-nums">{c.timestamp}</span>
                              </div>
                              <p className="text-slate-700 mt-0.5 leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        ))}

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const draft = commentDrafts[post.id]?.trim();
                            if (!draft) return;
                            onAddComment(post.id, draft);
                            setCommentDrafts((prev) => ({ ...prev, [post.id]: '' }));
                          }}
                          className="flex items-center gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={commentDrafts[post.id] ?? ''}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            placeholder="Write a comment..."
                            className="flex-1 h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                          />
                          <button
                            type="submit"
                            className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Widgets Column */}
        <aside className="xl:col-span-4 space-y-5">
          {/* Quick Batch Stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {activeInstitution ? `${activeInstitution.shortName} Snapshot` : 'Your Network Reach'}
              </h2>
              <Users className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {activeInstitution
                    ? activeInstitution.verifiedCount.toLocaleString('en-IN')
                    : totalVerifiedAcrossAll.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Verified Alumni</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {activeInstitution ? `${activeInstitution.activeBatchRate}%` : '78%'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Batch Activation</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {alumni.filter((a) => a.openTo.includes('Hiring')).length}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Alumni Hiring Now</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {events.filter((e) => e.rsvped).length}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Your Active RSVPs</div>
              </div>
            </div>
          </div>

          {/* Upcoming Milestone Reunions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Reunions & Meetups</h2>
              <button
                type="button"
                onClick={() => onNavigateSection('events')}
                className="text-xs font-medium hover:underline"
                style={{ color: theme.primary }}
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingReunions.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onNavigateSection('events')}
                  className="w-full py-3 first:pt-0 last:pb-0 text-left hover:bg-slate-50/70 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    {ev.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ev.dateDisplay}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    {ev.rsvpCount} attending · {ev.priceDisplay}
                    {ev.rsvped ? ' · Registered' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Alumni Near You */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Alumni Near You · {user.city}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified peers within 10 km
                </p>
              </div>
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100">
              {nearbyAlumni.map((alum) => (
                <button
                  key={alum.id}
                  type="button"
                  onClick={() => onOpenAlumnus(alum)}
                  className="w-full py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 text-left hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <AlumniAvatar
                    name={alum.name}
                    initials={alum.initials}
                    tone={alum.avatarTone}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {alum.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {alum.role} · {alum.company}
                    </div>
                  </div>
                  {alum.distanceKm && (
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                      {alum.distanceKm} km
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateSection('directory')}
              className="w-full py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
            >
              Open City Cluster Directory
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
