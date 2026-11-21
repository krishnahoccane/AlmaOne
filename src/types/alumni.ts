export type WorkspaceId = 'all' | string;

export type NavSection =
  | 'feed'
  | 'directory'
  | 'groups'
  | 'jobs'
  | 'mentorship'
  | 'events'
  | 'businesses'
  | 'giving'
  | 'id-card'
  | 'admin';

export interface InstitutionTheme {
  primary: string;
  primaryHover: string;
  secondary: string;
  softBg: string;
  softBorder: string;
  textAccent: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: 'High School' | 'Engineering Institute' | 'Business School' | 'University';
  location: string;
  foundedYear: number;
  motto: string;
  bannerUrl: string;
  crestVariant: 'shield' | 'compass' | 'laurel' | 'columns';
  theme: InstitutionTheme;
  verifiedCount: number;
  activeBatchRate: number;
  // Current user's credential at this institution
  userCredential: {
    degree: string;
    department: string;
    batchYear: number;
    rollNumber: string;
    verificationMethod: 'Official Email' | 'Roll Number Registry' | 'Peer Vouched';
    verifiedSince: string;
    campusAccessCode: string;
  };
}

export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showCompany: boolean;
  allowDirectMessages: boolean;
  searchableInDirectory: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  openTo: OpenToTag[];
  privacy: PrivacySettings;
}

export type OpenToTag =
  | 'Hiring'
  | 'Open to Mentoring'
  | 'Available for Coffee'
  | 'Seeking Co-founder';

export interface AlumniCredential {
  institutionId: string;
  degree: string;
  department: string;
  batchYear: number;
}

export interface CareerEntry {
  role: string;
  company: string;
  period: string;
  location: string;
  current?: boolean;
}

export interface Alumnus {
  id: string;
  name: string;
  initials: string;
  avatarTone: string;
  role: string;
  company: string;
  industry: string;
  city: string;
  country: string;
  credentials: AlumniCredential[];
  openTo: OpenToTag[];
  bio: string;
  email: string;
  phone: string;
  showEmail: boolean;
  showPhone: boolean;
  linkedinHandle: string;
  careerTimeline: CareerEntry[];
  connected: boolean;
  connectionPending?: boolean;
  distanceKm?: number;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface FeedComment {
  id: string;
  authorName: string;
  authorInitials: string;
  authorMeta: string;
  content: string;
  timestamp: string;
}

export interface FeedPost {
  id: string;
  institutionId: string; // specific institution or 'all'
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorAvatarUrl?: string;
  authorTone: string;
  authorRole: string;
  authorCredentialLabel: string;
  type: 'announcement' | 'milestone' | 'update' | 'question' | 'poll';
  milestoneLabel?: string;
  title?: string;
  content: string;
  timestamp: string;
  likes: number;
  likedByMe: boolean;
  bookmarked: boolean;
  comments: FeedComment[];
  poll?: {
    question: string;
    closesIn: string;
    options: PollOption[];
    votedOptionId?: string;
  };
  isOfficialBroadcast?: boolean;
  broadcastSegment?: string;
}

export interface GroupMessage {
  id: string;
  authorName: string;
  authorInitials: string;
  authorTone: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface GroupDiscussion {
  id: string;
  title: string;
  startedBy: string;
  timestamp: string;
  replies: {
    id: string;
    authorName: string;
    content: string;
    timestamp: string;
  }[];
}

export interface AlumniGroup {
  id: string;
  name: string;
  category: 'batch' | 'regional' | 'club';
  institutionId: string; // or 'all' for cross-campus regional hubs
  description: string;
  memberCount: number;
  joined: boolean;
  leadName: string;
  locationOrYear: string;
  recentActivity: string;
  posts: GroupMessage[];
  discussions: GroupDiscussion[];
  featuredMemberIds: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Hybrid' | 'On-site' | 'Remote';
  employmentType: 'Full-time' | 'Leadership' | 'Founding Team' | 'Advisory';
  experienceLevel: string;
  compensation: string;
  institutionId: string;
  postedById: string;
  postedByName: string;
  postedByRole: string;
  postedByBatch: string;
  postedAt: string;
  directReferral: boolean;
  referralRequested?: boolean;
  description: string;
  requirements: string[];
  applicantsCount: number;
}

export interface MentorSlot {
  id: string;
  dateLabel: string;
  timeLabel: string;
  booked: boolean;
}

export interface Mentor {
  id: string;
  alumnusId: string;
  name: string;
  initials: string;
  avatarTone: string;
  role: string;
  company: string;
  institutionId: string;
  credentialLabel: string;
  expertise: string[];
  sessionsCompleted: number;
  responseTime: string;
  bio: string;
  slots: MentorSlot[];
}

export interface BookedMentorshipSession {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  dateLabel: string;
  timeLabel: string;
  topic: string;
  notes: string;
}

export interface AlumniEvent {
  id: string;
  title: string;
  category: 'Milestone Reunion' | 'City Meetup' | 'Virtual Webinar';
  institutionId: string;
  dateIso: string; // YYYY-MM-DD
  dateDisplay: string;
  timeDisplay: string;
  location: string;
  isVirtual: boolean;
  priceDisplay: string;
  isPaid: boolean;
  rsvpCount: number;
  capacity: number;
  rsvped: boolean;
  passCode?: string;
  description: string;
  hostName: string;
  attendeeInitials: string[];
  milestoneBadge?: string;
}

export interface AlumniBusiness {
  id: string;
  name: string;
  tagline: string;
  category: 'SaaS & AI' | 'FinTech' | 'Consumer & D2C' | 'Advisory & Agencies' | 'HealthTech' | 'Hospitality';
  institutionId: string;
  founderId: string;
  founderName: string;
  founderBatch: string;
  city: string;
  website: string;
  discountCode: string;
  discountOffer: string;
  description: string;
}

export interface FundraisingCampaign {
  id: string;
  title: string;
  institutionId: string;
  category: string;
  goalAmountInr: number;
  raisedAmountInr: number;
  donorCount: number;
  daysLeft: number;
  summary: string;
  impactNote: string;
}

export interface BatchGivingEntry {
  batchYear: number;
  institutionId: string;
  participationPct: number;
  donorsCount: number;
  totalRaisedInr: number;
}

export interface VerificationRequest {
  id: string;
  institutionId: string;
  applicantName: string;
  email: string;
  claimedDegree: string;
  claimedDepartment: string;
  claimedBatch: number;
  rollNumber: string;
  rollMatchStatus: 'Exact Match' | 'Partial Match' | 'Manual Review';
  peerVouches: number;
  peerVouchNames: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BroadcastRecord {
  id: string;
  institutionId: string;
  title: string;
  body: string;
  targetBatch: string;
  targetDepartment: string;
  targetCity: string;
  estimatedReach: number;
  sentAt: string;
}

export interface DirectMessageThread {
  id: string;
  alumnusId: string;
  alumnusName: string;
  alumnusInitials: string;
  alumnusTone: string;
  alumnusMeta: string;
  unreadCount: number;
  messages: {
    id: string;
    sender: 'me' | 'them';
    text: string;
    timestamp: string;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetSection: NavSection;
  institutionId?: string;
}
