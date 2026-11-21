import React, { useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  AlumniBusiness,
  AlumniEvent,
  AlumniGroup,
  Alumnus,
  AppNotification,
  BatchGivingEntry,
  BookedMentorshipSession,
  BroadcastRecord,
  DirectMessageThread,
  FeedPost,
  FundraisingCampaign,
  Institution,
  JobListing,
  Mentor,
  NavSection,
  PrivacySettings,
  UserProfile,
  VerificationRequest,
  WorkspaceId,
} from './types/alumni';
import {
  INITIAL_ALUMNI,
  INITIAL_BATCH_LEADERBOARD,
  INITIAL_BROADCASTS,
  INITIAL_BUSINESSES,
  INITIAL_CAMPAIGNS,
  INITIAL_EVENTS,
  INITIAL_GROUPS,
  INITIAL_INSTITUTIONS,
  INITIAL_JOBS,
  INITIAL_MENTORS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSTS,
  INITIAL_USER,
  INITIAL_VERIFICATION_REQUESTS,
  UNIFIED_THEME,
} from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { AddAlmaMaterModal } from './components/modals/AddAlmaMaterModal';
import { ProfileDrawer } from './components/drawers/ProfileDrawer';
import { MessagesDrawer } from './components/drawers/MessagesDrawer';
import { HomeFeedView } from './components/views/HomeFeedView';
import { DirectoryView } from './components/views/DirectoryView';
import { GroupsView } from './components/views/GroupsView';
import { JobsView } from './components/views/JobsView';
import { MentorshipView } from './components/views/MentorshipView';
import { EventsView } from './components/views/EventsView';
import { BusinessDirectoryView } from './components/views/BusinessDirectoryView';
import { GivingView } from './components/views/GivingView';
import { DigitalIdView } from './components/views/DigitalIdView';
import { AdminPortalView } from './components/views/AdminPortalView';

export const AlmaOneApp: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('all');
  const [activeSection, setActiveSection] = useState<NavSection>('feed');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [alumni, setAlumni] = useState<Alumnus[]>(INITIAL_ALUMNI);
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [groups, setGroups] = useState<AlumniGroup[]>(INITIAL_GROUPS);
  const [jobs, setJobs] = useState<JobListing[]>(INITIAL_JOBS);
  const [mentors, setMentors] = useState<Mentor[]>(INITIAL_MENTORS);
  const [bookedSessions, setBookedSessions] = useState<BookedMentorshipSession[]>([
    {
      id: 'bs-init-1',
      mentorId: 'm-1',
      mentorName: 'Ananya Deshmukh',
      mentorRole: 'Principal Product Manager · Stripe',
      dateLabel: 'Sat, Nov 28',
      timeLabel: '11:00 AM IST',
      topic: 'FinTech Strategy',
      notes: 'Comparing APAC cross-border merchant onboarding workflows.',
    },
  ]);
  const [events, setEvents] = useState<AlumniEvent[]>(INITIAL_EVENTS);
  const [businesses, setBusinesses] = useState<AlumniBusiness[]>(INITIAL_BUSINESSES);
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>(INITIAL_CAMPAIGNS);
  const [leaderboard, setLeaderboard] = useState<BatchGivingEntry[]>(INITIAL_BATCH_LEADERBOARD);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(
    INITIAL_VERIFICATION_REQUESTS
  );
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(INITIAL_BROADCASTS);
  const [threads, setThreads] = useState<DirectMessageThread[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [addAlmaMaterOpen, setAddAlmaMaterOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(INITIAL_MESSAGES[0].id);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3400);
  };

  const activeInstitution = useMemo(
    () => (activeWorkspace === 'all' ? null : institutions.find((i) => i.id === activeWorkspace) ?? null),
    [activeWorkspace, institutions]
  );

  const theme = activeInstitution ? activeInstitution.theme : UNIFIED_THEME;

  const selectedAlumnus = useMemo(
    () => alumni.find((a) => a.id === selectedProfileId) ?? null,
    [alumni, selectedProfileId]
  );

  const pendingAdminCount = useMemo(
    () =>
      verificationRequests.filter(
        (r) =>
          r.status === 'pending' &&
          (activeWorkspace === 'all' || r.institutionId === activeWorkspace)
      ).length,
    [verificationRequests, activeWorkspace]
  );

  const unreadMessagesCount = useMemo(
    () => threads.reduce((sum, t) => sum + t.unreadCount, 0),
    [threads]
  );

  const handleSelectWorkspace = (id: WorkspaceId) => {
    setActiveWorkspace(id);
    const label =
      id === 'all'
        ? 'All Alma Maters (Unified View)'
        : institutions.find((i) => i.id === id)?.name ?? 'Campus Workspace';
    showToast(`Switched workspace to ${label}`);
  };

  const handleAddInstitution = (newInst: Institution) => {
    setInstitutions((prev) => [...prev, newInst]);
    setActiveWorkspace(newInst.id);
    showToast(`${newInst.name} verified and linked to your unified profile.`);
  };

  const handleUpdatePrivacy = (next: Partial<PrivacySettings>) => {
    setUser((prev) => ({ ...prev, privacy: { ...prev.privacy, ...next } }));
    showToast('Privacy preferences updated across all campuses.');
  };

  const handleCreatePost = (payload: {
    institutionId: string;
    type: 'update' | 'question' | 'milestone';
    milestoneLabel?: string;
    title: string;
    content: string;
  }) => {
    const inst = institutions.find((i) => i.id === payload.institutionId);
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      institutionId: payload.institutionId,
      authorId: user.id,
      authorName: user.name,
      authorInitials: 'RS',
      authorAvatarUrl: user.avatarUrl,
      authorTone: theme.primary,
      authorRole: `${user.role} at ${user.company}`,
      authorCredentialLabel: inst
        ? `${inst.name} · Class of ${inst.userCredential.batchYear}`
        : 'Verified Alumnus',
      type: payload.type,
      milestoneLabel: payload.milestoneLabel,
      title: payload.title || undefined,
      content: payload.content,
      timestamp: 'Just now',
      likes: 1,
      likedByMe: true,
      bookmarked: false,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    showToast(`Published to ${inst?.shortName ?? 'your alumni feed'}.`);
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        const previousVote = p.poll.votedOptionId;
        if (previousVote === optionId) return p;
        const updatedOptions = p.poll.options.map((opt) => {
          if (opt.id === optionId) return { ...opt, votes: opt.votes + 1 };
          if (opt.id === previousVote) return { ...opt, votes: Math.max(0, opt.votes - 1) };
          return opt;
        });
        return {
          ...p,
          poll: {
            ...p.poll,
            options: updatedOptions,
            votedOptionId: optionId,
          },
        };
      })
    );
    showToast('Your vote has been recorded.');
  };

  const handleAddComment = (postId: string, content: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c-${Date.now()}`,
                  authorName: user.name,
                  authorInitials: 'RS',
                  authorMeta: 'NITW ’18 · ISB ’22',
                  content,
                  timestamp: 'Just now',
                },
              ],
            }
          : p
      )
    );
  };

  const handleToggleConnect = (alumnusId: string) => {
    setAlumni((prev) =>
      prev.map((a) => {
        if (a.id !== alumnusId) return a;
        if (a.connected) return a;
        const nextPending = !a.connectionPending;
        showToast(
          nextPending
            ? `Connection request sent to ${a.name}.`
            : `Withdrew connection request to ${a.name}.`
        );
        return { ...a, connectionPending: nextPending };
      })
    );
  };

  const handleOpenMessageWithAlumnus = (alumnus: Alumnus) => {
    setSelectedProfileId(null);
    const existing = threads.find((t) => t.alumnusId === alumnus.id);
    if (existing) {
      setActiveThreadId(existing.id);
      setThreads((prev) =>
        prev.map((t) => (t.id === existing.id ? { ...t, unreadCount: 0 } : t))
      );
    } else {
      const newThread: DirectMessageThread = {
        id: `dm-${Date.now()}`,
        alumnusId: alumnus.id,
        alumnusName: alumnus.name,
        alumnusInitials: alumnus.initials,
        alumnusTone: alumnus.avatarTone,
        alumnusMeta: `${alumnus.role} at ${alumnus.company} · ${alumnus.city}`,
        unreadCount: 0,
        messages: [],
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    }
    setMessagesOpen(true);
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleSendMessage = (threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: `m-${Date.now()}`,
                  sender: 'me',
                  text,
                  timestamp: 'Just now',
                },
              ],
            }
          : t
      )
    );
  };

  const handleRequestMentorshipFromProfile = (alumnus: Alumnus) => {
    setSelectedProfileId(null);
    setActiveSection('mentorship');
    showToast(`Browse ${alumnus.name} and verified mentors in the Mentorship Hub.`);
  };

  const handleToggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const nextJoined = !g.joined;
        showToast(nextJoined ? `Joined ${g.name}.` : `Left ${g.name}.`);
        return {
          ...g,
          joined: nextJoined,
          memberCount: nextJoined ? g.memberCount + 1 : g.memberCount - 1,
        };
      })
    );
  };

  const handleAddGroupPost = (groupId: string, content: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              recentActivity: 'Active just now',
              posts: [
                {
                  id: `gm-${Date.now()}`,
                  authorName: user.name,
                  authorInitials: 'RS',
                  authorTone: theme.primary,
                  authorRole: `${user.role} · ${user.company}`,
                  content,
                  timestamp: 'Just now',
                  likes: 1,
                },
                ...g.posts,
              ],
            }
          : g
      )
    );
    showToast('Posted update to group.');
  };

  const handleAddDiscussionReply = (groupId: string, discussionId: string, content: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              discussions: g.discussions.map((d) =>
                d.id === discussionId
                  ? {
                      ...d,
                      replies: [
                        ...d.replies,
                        {
                          id: `rep-${Date.now()}`,
                          authorName: user.name,
                          content,
                          timestamp: 'Just now',
                        },
                      ],
                    }
                  : d
              ),
            }
          : g
      )
    );
  };

  const handleRequestReferral = (jobId: string, _note: string, _resumeName: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, referralRequested: true, applicantsCount: j.applicantsCount + 1 }
          : j
      )
    );
    showToast('Referral request and resume note sent to the alumni poster.');
  };

  const handlePostJob = (job: Omit<JobListing, 'id' | 'postedAt' | 'applicantsCount'>) => {
    const created: JobListing = {
      ...job,
      id: `job-${Date.now()}`,
      postedAt: 'Just now',
      applicantsCount: 0,
    };
    setJobs((prev) => [created, ...prev]);
    showToast(`Published “${created.title}” to the Jobs & Referrals board.`);
  };

  const handleBookSession = (payload: {
    mentorId: string;
    slotId: string;
    topic: string;
    notes: string;
  }) => {
    const mentor = mentors.find((m) => m.id === payload.mentorId);
    const slot = mentor?.slots.find((s) => s.id === payload.slotId);
    if (!mentor || !slot) return;

    setMentors((prev) =>
      prev.map((m) =>
        m.id === payload.mentorId
          ? {
              ...m,
              slots: m.slots.map((s) => (s.id === payload.slotId ? { ...s, booked: true } : s)),
            }
          : m
      )
    );

    setBookedSessions((prev) => [
      {
        id: `bs-${Date.now()}`,
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorRole: `${mentor.role} · ${mentor.company}`,
        dateLabel: slot.dateLabel,
        timeLabel: slot.timeLabel,
        topic: payload.topic,
        notes: payload.notes,
      },
      ...prev,
    ]);

    showToast(`30-min session confirmed with ${mentor.name} on ${slot.dateLabel}.`);
  };

  const handleRsvpEvent = (eventId: string): AlumniEvent | undefined => {
    let updatedEvent: AlumniEvent | undefined;
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const passCode =
          ev.passCode ??
          `${ev.institutionId.slice(0, 3).toUpperCase()}-26-${Math.floor(1000 + Math.random() * 9000)}`;
        updatedEvent = {
          ...ev,
          rsvped: true,
          rsvpCount: ev.rsvpCount + 1,
          passCode,
        };
        return updatedEvent;
      })
    );
    showToast('RSVP confirmed! Your QR Entry Pass is ready.');
    return updatedEvent;
  };

  const handleAddBusiness = (biz: Omit<AlumniBusiness, 'id'>) => {
    setBusinesses((prev) => [{ ...biz, id: `biz-${Date.now()}` }, ...prev]);
    showToast(`${biz.name} added to the Alumni Business Directory.`);
  };

  const handleDonate = (payload: {
    campaignId: string;
    amountInr: number;
    batchYear: number;
    anonymous: boolean;
  }) => {
    const campaign = campaigns.find((c) => c.id === payload.campaignId);
    if (!campaign) return;

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === payload.campaignId
          ? {
              ...c,
              raisedAmountInr: c.raisedAmountInr + payload.amountInr,
              donorCount: c.donorCount + 1,
            }
          : c
      )
    );

    setLeaderboard((prev) => {
      const exists = prev.some(
        (e) => e.institutionId === campaign.institutionId && e.batchYear === payload.batchYear
      );
      if (exists) {
        return prev.map((e) =>
          e.institutionId === campaign.institutionId && e.batchYear === payload.batchYear
            ? {
                ...e,
                donorsCount: e.donorsCount + 1,
                totalRaisedInr: e.totalRaisedInr + payload.amountInr,
                participationPct: Math.min(99.9, +(e.participationPct + 0.4).toFixed(1)),
              }
            : e
        );
      }
      return [
        ...prev,
        {
          batchYear: payload.batchYear,
          institutionId: campaign.institutionId,
          participationPct: 12.5,
          donorsCount: 1,
          totalRaisedInr: payload.amountInr,
        },
      ];
    });

    showToast(`Thank you! ₹${payload.amountInr.toLocaleString('en-IN')} credited to Class of ${payload.batchYear}.`);
  };

  const handleApproveVerification = (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;
    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === req.institutionId
          ? { ...inst, verifiedCount: inst.verifiedCount + 1 }
          : inst
      )
    );
    showToast(`Approved ${req.applicantName} as a verified alumnus.`);
  };

  const handleRejectVerification = (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
    if (req) {
      showToast(`Marked ${req.applicantName}'s verification request as rejected.`);
    }
  };

  const handleSendBroadcast = (payload: {
    institutionId: string;
    title: string;
    body: string;
    targetBatch: string;
    targetDepartment: string;
    targetCity: string;
    estimatedReach: number;
  }) => {
    const inst = institutions.find((i) => i.id === payload.institutionId);
    const newRecord: BroadcastRecord = {
      id: `bc-${Date.now()}`,
      ...payload,
      sentAt: 'Just now',
    };
    setBroadcasts((prev) => [newRecord, ...prev]);

    const officialPost: FeedPost = {
      id: `post-bc-${Date.now()}`,
      institutionId: payload.institutionId,
      authorId: `admin-${payload.institutionId}`,
      authorName: `${inst?.shortName ?? 'Campus'} Alumni Office`,
      authorInitials: (inst?.shortName ?? 'AO').slice(0, 2).toUpperCase(),
      authorTone: inst?.theme.primary ?? '#0F172A',
      authorRole: 'Official Institutional Announcement',
      authorCredentialLabel: `${inst?.name ?? 'Alumni Relations'} · Verified Broadcast`,
      type: 'announcement',
      isOfficialBroadcast: true,
      broadcastSegment: `${payload.targetBatch} · ${payload.targetCity}`,
      title: payload.title,
      content: payload.body,
      timestamp: 'Just now',
      likes: 0,
      likedByMe: false,
      bookmarked: false,
      comments: [],
    };
    setPosts((prev) => [officialPost, ...prev]);
    showToast(
      `Broadcast dispatched to ${payload.estimatedReach.toLocaleString('en-IN')} alumni and posted to Home Feed.`
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FB] text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        activeWorkspace={activeWorkspace}
        activeInstitution={activeInstitution}
        institutions={institutions}
        theme={theme}
        pendingAdminCount={pendingAdminCount}
        onOpenAddAlmaMater={() => setAddAlmaMaterOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          institutions={institutions}
          activeWorkspace={activeWorkspace}
          activeInstitution={activeInstitution}
          theme={theme}
          user={user}
          alumni={alumni}
          jobs={jobs}
          events={events}
          businesses={businesses}
          notifications={notifications}
          unreadMessagesCount={unreadMessagesCount}
          onSelectWorkspace={handleSelectWorkspace}
          onOpenAddAlmaMater={() => setAddAlmaMaterOpen(true)}
          onOpenMessages={() => setMessagesOpen(true)}
          onMarkNotificationsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onNavigateSection={setActiveSection}
          onOpenAlumnusProfile={(alum) => setSelectedProfileId(alum.id)}
          onUpdatePrivacy={handleUpdatePrivacy}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeSection === 'feed' && (
            <HomeFeedView
              activeWorkspace={activeWorkspace}
              activeInstitution={activeInstitution}
              institutions={institutions}
              theme={theme}
              user={user}
              posts={posts}
              alumni={alumni}
              events={events}
              onCreatePost={handleCreatePost}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onVotePoll={handleVotePoll}
              onAddComment={handleAddComment}
              onOpenAlumnus={(alum) => setSelectedProfileId(alum.id)}
              onNavigateSection={setActiveSection}
            />
          )}

          {activeSection === 'directory' && (
            <DirectoryView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              alumni={alumni}
              theme={theme}
              onOpenAlumnus={(alum) => setSelectedProfileId(alum.id)}
              onToggleConnect={handleToggleConnect}
            />
          )}

          {activeSection === 'groups' && (
            <GroupsView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              groups={groups}
              alumni={alumni}
              theme={theme}
              onToggleJoinGroup={handleToggleJoinGroup}
              onAddGroupPost={handleAddGroupPost}
              onAddDiscussionReply={handleAddDiscussionReply}
              onOpenAlumnus={(alum) => setSelectedProfileId(alum.id)}
            />
          )}

          {activeSection === 'jobs' && (
            <JobsView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              jobs={jobs}
              alumni={alumni}
              theme={theme}
              onRequestReferral={handleRequestReferral}
              onPostJob={handlePostJob}
              onOpenAlumnus={(alum) => setSelectedProfileId(alum.id)}
            />
          )}

          {activeSection === 'mentorship' && (
            <MentorshipView
              activeWorkspace={activeWorkspace}
              mentors={mentors}
              bookedSessions={bookedSessions}
              alumni={alumni}
              theme={theme}
              onBookSession={handleBookSession}
              onOpenAlumnus={(alum) => setSelectedProfileId(alum.id)}
            />
          )}

          {activeSection === 'events' && (
            <EventsView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              events={events}
              user={user}
              theme={theme}
              onRsvpEvent={handleRsvpEvent}
            />
          )}

          {activeSection === 'businesses' && (
            <BusinessDirectoryView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              businesses={businesses}
              alumni={alumni}
              theme={theme}
              onAddBusiness={handleAddBusiness}
              onOpenAlumnus={(alum) => setSelectedProfileId(alum.id)}
            />
          )}

          {activeSection === 'giving' && (
            <GivingView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              campaigns={campaigns}
              leaderboard={leaderboard}
              theme={theme}
              onDonate={handleDonate}
            />
          )}

          {activeSection === 'id-card' && (
            <DigitalIdView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              user={user}
              onUpdatePrivacy={handleUpdatePrivacy}
            />
          )}

          {activeSection === 'admin' && (
            <AdminPortalView
              activeWorkspace={activeWorkspace}
              institutions={institutions}
              verificationRequests={verificationRequests}
              broadcasts={broadcasts}
              onApproveVerification={handleApproveVerification}
              onRejectVerification={handleRejectVerification}
              onSendBroadcast={handleSendBroadcast}
            />
          )}
        </main>
      </div>

      <AddAlmaMaterModal
        open={addAlmaMaterOpen}
        onClose={() => setAddAlmaMaterOpen(false)}
        onAddInstitution={handleAddInstitution}
      />

      <ProfileDrawer
        alumnus={selectedAlumnus}
        institutions={institutions}
        theme={theme}
        onClose={() => setSelectedProfileId(null)}
        onToggleConnect={handleToggleConnect}
        onSendMessage={handleOpenMessageWithAlumnus}
        onRequestMentorship={handleRequestMentorshipFromProfile}
      />

      <MessagesDrawer
        open={messagesOpen}
        threads={threads}
        activeThreadId={activeThreadId}
        theme={theme}
        onSelectThread={handleSelectThread}
        onSendMessage={handleSendMessage}
        onClose={() => setMessagesOpen(false)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2.5 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 text-slate-400 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
