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
  InstitutionTheme,
  JobListing,
  Mentor,
  NavSection,
  OpenToTag,
  UserProfile,
  VerificationRequest,
  WorkspaceId,
} from '../types/alumni';
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
} from '../data/mockData';

export interface AppState {
  user: UserProfile;
  institutions: Institution[];
  activeWorkspace: WorkspaceId;
  activeSection: NavSection;
  mobileMenuOpen: boolean;

  // Top Header Dropdowns
  switcherOpen: boolean;
  notifOpen: boolean;
  profileOpen: boolean;
  globalSearch: string;
  globalSearchOpen: boolean;

  // Collections
  alumni: Alumnus[];
  posts: FeedPost[];
  groups: AlumniGroup[];
  jobs: JobListing[];
  mentors: Mentor[];
  bookedSessions: BookedMentorshipSession[];
  events: AlumniEvent[];
  businesses: AlumniBusiness[];
  campaigns: FundraisingCampaign[];
  leaderboard: BatchGivingEntry[];
  verificationRequests: VerificationRequest[];
  broadcasts: BroadcastRecord[];
  threads: DirectMessageThread[];
  notifications: AppNotification[];

  // Feed UI State
  composerType: 'update' | 'question' | 'milestone';
  composerMilestone: string;
  composerInstId: string;
  composerTitle: string;
  composerContent: string;
  feedFilter: 'all' | 'announcement' | 'milestone' | 'poll';
  openComments: Record<string, boolean>;

  // Directory UI State
  dirViewMode: 'grid' | 'map';
  dirQuery: string;
  dirBatch: string;
  dirDept: string;
  dirCity: string;
  dirIndustry: string;
  dirCompany: string;
  dirOpenTo: OpenToTag[];
  dirMapCity: string | null;

  // Groups UI State
  groupTab: 'batch' | 'regional' | 'club';
  selectedGroupId: string | null;
  groupSubTab: 'feed' | 'members' | 'discussions';

  // Jobs UI State
  jobQuery: string;
  jobType: string;
  jobReferralOnly: boolean;
  selectedJobId: string | null;
  postJobModalOpen: boolean;

  // Mentorship UI State
  mentorExpertise: string;
  bookingMentorId: string | null;
  bookingSlotId: string;

  // Events UI State
  eventCategory: string;
  ticketEventId: string | null;

  // Business UI State
  bizCategory: string;
  bizQuery: string;
  copiedBizId: string | null;
  addBizModalOpen: boolean;

  // Giving UI State
  donateCampaignId: string | null;
  donateAmount: number;
  donateAnonymous: boolean;
  donateReceipt: string | null;

  // Digital ID UI State
  idCardInstId: string;
  idCardFlipped: boolean;

  // Admin Portal UI State
  adminInstId: string;
  adminTab: 'queue' | 'analytics' | 'broadcast';
  adminStatusFilter: 'pending' | 'all';
  bcBatch: string;
  bcDept: string;
  bcCity: string;
  bcTitle: string;
  bcBody: string;

  // Overlays & Modals
  selectedProfileId: string | null;
  messagesOpen: boolean;
  activeThreadId: string | null;

  // Add Alma Mater Modal
  addCampusOpen: boolean;
  addCampusStep: 1 | 2 | 3;
  addCampusName: string;
  addCampusType: Institution['type'];
  addCampusLocation: string;
  addCampusDegree: string;
  addCampusDept: string;
  addCampusBatch: string;
  addCampusThemeId: string;
  addCampusMethod: 'email' | 'roll' | 'peer';
  addCampusEmail: string;
  addCampusOtpSent: boolean;
  addCampusOtpCode: string;
  addCampusRoll: string;
  addCampusRollVerified: boolean;
  addCampusPeerConfirmed: boolean;

  toast: string | null;
}

export function createInitialState(): AppState {
  return {
    user: structuredClone(INITIAL_USER),
    institutions: structuredClone(INITIAL_INSTITUTIONS),
    activeWorkspace: 'all',
    activeSection: 'feed',
    mobileMenuOpen: false,

    switcherOpen: false,
    notifOpen: false,
    profileOpen: false,
    globalSearch: '',
    globalSearchOpen: false,

    alumni: structuredClone(INITIAL_ALUMNI),
    posts: structuredClone(INITIAL_POSTS),
    groups: structuredClone(INITIAL_GROUPS),
    jobs: structuredClone(INITIAL_JOBS),
    mentors: structuredClone(INITIAL_MENTORS),
    bookedSessions: [
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
    ],
    events: structuredClone(INITIAL_EVENTS),
    businesses: structuredClone(INITIAL_BUSINESSES),
    campaigns: structuredClone(INITIAL_CAMPAIGNS),
    leaderboard: structuredClone(INITIAL_BATCH_LEADERBOARD),
    verificationRequests: structuredClone(INITIAL_VERIFICATION_REQUESTS),
    broadcasts: structuredClone(INITIAL_BROADCASTS),
    threads: structuredClone(INITIAL_MESSAGES),
    notifications: structuredClone(INITIAL_NOTIFICATIONS),

    composerType: 'update',
    composerMilestone: 'Career Promotion',
    composerInstId: 'nit-warangal',
    composerTitle: '',
    composerContent: '',
    feedFilter: 'all',
    openComments: {},

    dirViewMode: 'grid',
    dirQuery: '',
    dirBatch: 'all',
    dirDept: 'all',
    dirCity: 'all',
    dirIndustry: 'all',
    dirCompany: 'all',
    dirOpenTo: [],
    dirMapCity: null,

    groupTab: 'batch',
    selectedGroupId: null,
    groupSubTab: 'feed',

    jobQuery: '',
    jobType: 'all',
    jobReferralOnly: false,
    selectedJobId: null,
    postJobModalOpen: false,

    mentorExpertise: 'All Topics',
    bookingMentorId: null,
    bookingSlotId: '',

    eventCategory: 'all',
    ticketEventId: null,

    bizCategory: 'All',
    bizQuery: '',
    copiedBizId: null,
    addBizModalOpen: false,

    donateCampaignId: null,
    donateAmount: 15000,
    donateAnonymous: false,
    donateReceipt: null,

    idCardInstId: 'nit-warangal',
    idCardFlipped: false,

    adminInstId: 'nit-warangal',
    adminTab: 'queue',
    adminStatusFilter: 'pending',
    bcBatch: 'All Batches',
    bcDept: 'All Departments',
    bcCity: 'All Cities',
    bcTitle: '',
    bcBody: '',

    selectedProfileId: null,
    messagesOpen: false,
    activeThreadId: INITIAL_MESSAGES[0].id,

    addCampusOpen: false,
    addCampusStep: 1,
    addCampusName: '',
    addCampusType: 'University',
    addCampusLocation: '',
    addCampusDegree: '',
    addCampusDept: '',
    addCampusBatch: '2024',
    addCampusThemeId: 'navy',
    addCampusMethod: 'email',
    addCampusEmail: 'rohan.sharma@alumni.iitb.ac.in',
    addCampusOtpSent: false,
    addCampusOtpCode: '',
    addCampusRoll: 'EX-2024-1104',
    addCampusRollVerified: false,
    addCampusPeerConfirmed: false,

    toast: null,
  };
}

export function getActiveInstitution(state: AppState): Institution | null {
  if (state.activeWorkspace === 'all') return null;
  return state.institutions.find((i) => i.id === state.activeWorkspace) ?? null;
}

export function getActiveTheme(state: AppState): InstitutionTheme {
  return getActiveInstitution(state)?.theme ?? UNIFIED_THEME;
}
