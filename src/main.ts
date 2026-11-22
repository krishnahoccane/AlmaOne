import './index.css';
import { UNIFIED_BANNER_URL } from './data/mockData';
import { AppState, createInitialState } from './state/store';
import {
  AlumniBusiness,
  FeedPost,
  Institution,
  JobListing,
  NavSection,
  OpenToTag,
  PrivacySettings,
} from './types/alumni';
import { downloadEventIcs } from './utils/ui';
import {
  renderAdminPortalView,
  renderBusinessDirectoryView,
  renderDigitalIdView,
  renderEventsView,
  renderGivingView,
} from './views/campusViews';
import {
  renderDirectoryView,
  renderGroupsView,
  renderHomeFeedView,
  renderJobsView,
  renderMentorshipView,
} from './views/memberViews';
import { renderOverlays, renderSidebar, renderTopHeader } from './views/overlays';

const state: AppState = createInitialState();
let toastTimer: number | null = null;
let copyResetTimer: number | null = null;

function showToast(message: string): void {
  state.toast = message;
  if (toastTimer !== null) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    state.toast = null;
    toastTimer = null;
    render();
  }, 3600);
}

function closeAllDropdowns(): boolean {
  const anyOpen =
    state.switcherOpen || state.notifOpen || state.profileOpen || state.globalSearchOpen;
  if (anyOpen) {
    state.switcherOpen = false;
    state.notifOpen = false;
    state.profileOpen = false;
    state.globalSearchOpen = false;
  }
  return anyOpen;
}

function renderActiveSection(): string {
  switch (state.activeSection) {
    case 'feed':
      return renderHomeFeedView(state);
    case 'directory':
      return renderDirectoryView(state);
    case 'groups':
      return renderGroupsView(state);
    case 'jobs':
      return renderJobsView(state);
    case 'mentorship':
      return renderMentorshipView(state);
    case 'events':
      return renderEventsView(state);
    case 'businesses':
      return renderBusinessDirectoryView(state);
    case 'giving':
      return renderGivingView(state);
    case 'id-card':
      return renderDigitalIdView(state);
    case 'admin':
      return renderAdminPortalView(state);
    default:
      return renderHomeFeedView(state);
  }
}

function render(): void {
  const root = document.getElementById('app');
  if (!root) return;

  // Preserve active text input focus and caret position across full DOM re-renders
  const activeEl = document.activeElement as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;
  const focusKey = activeEl?.getAttribute('data-input') ?? null;
  const focusName =
    !focusKey && activeEl?.form?.getAttribute('data-form')
      ? `${activeEl.form.getAttribute('data-form')}::${activeEl.name}`
      : null;
  const selStart = activeEl && 'selectionStart' in activeEl ? activeEl.selectionStart : null;
  const selEnd = activeEl && 'selectionEnd' in activeEl ? activeEl.selectionEnd : null;

  root.innerHTML = `
    <div class="min-h-screen flex bg-[#F7F7F5] text-stone-900">
      ${renderSidebar(state)}
      <div class="flex-1 flex flex-col min-w-0">
        ${renderTopHeader(state)}
        <main class="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          ${renderActiveSection()}
        </main>
      </div>
    </div>
    ${renderOverlays(state)}
  `;

  if (focusKey) {
    const nextEl = root.querySelector(`[data-input="${CSS.escape(focusKey)}"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (nextEl) {
      nextEl.focus({ preventScroll: true });
      if (selStart !== null && selEnd !== null && typeof nextEl.setSelectionRange === 'function') {
        try {
          nextEl.setSelectionRange(selStart, selEnd);
        } catch {
          // Ignore input types that do not support selection range (e.g., email/number)
        }
      }
    }
  } else if (focusName) {
    const [formId, fieldName] = focusName.split('::');
    const nextEl = root.querySelector(
      `form[data-form="${CSS.escape(formId)}"] [name="${CSS.escape(fieldName)}"]`
    ) as HTMLInputElement | HTMLTextAreaElement | null;
    if (nextEl) {
      nextEl.focus({ preventScroll: true });
      if (selStart !== null && selEnd !== null && typeof nextEl.setSelectionRange === 'function') {
        try {
          nextEl.setSelectionRange(selStart, selEnd);
        } catch {
          // Ignore unsupported input types
        }
      }
    }
  }
}

function resetAddCampusWizard(): void {
  state.addCampusStep = 1;
  state.addCampusName = '';
  state.addCampusType = 'University';
  state.addCampusLocation = '';
  state.addCampusDegree = '';
  state.addCampusDept = '';
  state.addCampusBatch = '2024';
  state.addCampusMethod = 'email';
  state.addCampusEmail = 'rohan.sharma@alumni.iitb.ac.in';
  state.addCampusOtpSent = false;
  state.addCampusOtpCode = '';
  state.addCampusRoll = 'EX-2024-1104';
  state.addCampusRollVerified = false;
  state.addCampusPeerConfirmed = false;
}

function handleAction(action: string, el: HTMLElement): void {
  switch (action) {
    // --- Navigation & Shell ---
    case 'nav': {
      const section = el.dataset.section as NavSection | undefined;
      if (section) {
        state.activeSection = section;
        state.mobileMenuOpen = false;
        closeAllDropdowns();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        render();
      }
      break;
    }

    case 'open-mobile-menu':
      state.mobileMenuOpen = true;
      render();
      break;

    case 'close-mobile-menu':
      state.mobileMenuOpen = false;
      render();
      break;

    case 'toggle-switcher': {
      const next = !state.switcherOpen;
      closeAllDropdowns();
      state.switcherOpen = next;
      render();
      break;
    }

    case 'switch-workspace': {
      const val = el.dataset.value ?? 'all';
      state.activeWorkspace = val;
      state.switcherOpen = false;
      state.selectedGroupId = null;
      if (val !== 'all') {
        state.composerInstId = val;
        state.idCardInstId = val;
        state.adminInstId = val;
        const inst = state.institutions.find((i) => i.id === val);
        showToast(`Switched workspace to ${inst?.name ?? val}`);
      } else {
        showToast(`Unified View active across all ${state.institutions.length} alma maters`);
      }
      render();
      break;
    }

    case 'clear-global-search':
      state.globalSearch = '';
      state.globalSearchOpen = false;
      render();
      break;

    case 'toggle-notifs': {
      const next = !state.notifOpen;
      closeAllDropdowns();
      state.notifOpen = next;
      render();
      break;
    }

    case 'mark-notifs-read':
      state.notifications.forEach((n) => {
        n.read = true;
      });
      showToast('All notifications marked as read');
      render();
      break;

    case 'open-notif': {
      const targetSection = el.dataset.section as NavSection | undefined;
      const instId = el.dataset.inst;
      state.notifications.forEach((n) => {
        if (n.targetSection === targetSection) n.read = true;
      });
      if (instId && state.institutions.some((i) => i.id === instId)) {
        state.activeWorkspace = instId;
      }
      if (targetSection) {
        state.activeSection = targetSection;
      }
      state.notifOpen = false;
      render();
      break;
    }

    case 'open-messages':
      closeAllDropdowns();
      state.messagesOpen = true;
      if (state.activeThreadId) {
        const t = state.threads.find((th) => th.id === state.activeThreadId);
        if (t) t.unreadCount = 0;
      }
      render();
      break;

    case 'close-messages':
      state.messagesOpen = false;
      render();
      break;

    case 'select-thread': {
      const id = el.dataset.id ?? null;
      state.activeThreadId = id;
      const t = state.threads.find((th) => th.id === id);
      if (t) t.unreadCount = 0;
      render();
      break;
    }

    case 'message-alumnus': {
      const alumId = el.dataset.id;
      const alum = state.alumni.find((a) => a.id === alumId);
      if (!alum) break;

      let thread = state.threads.find((t) => t.alumnusId === alum.id);
      if (!thread) {
        const firstCred = alum.credentials[0];
        const inst = state.institutions.find((i) => i.id === firstCred?.institutionId);
        thread = {
          id: `dm-${Date.now()}`,
          alumnusId: alum.id,
          alumnusName: alum.name,
          alumnusInitials: alum.initials,
          alumnusTone: alum.avatarTone,
          alumnusMeta: `${alum.role} · ${alum.company}${
            inst ? ` · ${inst.shortName} ’${String(firstCred.batchYear).slice(-2)}` : ''
          }`,
          unreadCount: 0,
          messages: [],
        };
        state.threads.unshift(thread);
      } else {
        thread.unreadCount = 0;
      }

      state.selectedProfileId = null;
      state.activeThreadId = thread.id;
      state.messagesOpen = true;
      render();
      break;
    }

    case 'mentor-alumnus': {
      const alumId = el.dataset.id;
      state.selectedProfileId = null;
      state.activeSection = 'mentorship';
      const mentor = state.mentors.find((m) => m.alumnusId === alumId);
      if (mentor) {
        const openSlot = mentor.slots.find((s) => !s.booked);
        if (openSlot) {
          state.bookingMentorId = mentor.id;
          state.bookingSlotId = openSlot.id;
        } else {
          showToast(`${mentor.name} has no open mentorship slots this month.`);
        }
      } else {
        showToast('Browse verified mentors in the Mentorship Hub');
      }
      render();
      break;
    }

    case 'toggle-profile-menu': {
      const next = !state.profileOpen;
      closeAllDropdowns();
      state.profileOpen = next;
      render();
      break;
    }

    case 'toggle-privacy': {
      const key = el.dataset.key as keyof PrivacySettings | undefined;
      if (key && key in state.user.privacy) {
        state.user.privacy[key] = !state.user.privacy[key];
        showToast('Privacy setting updated across your profile and Digital ID');
        render();
      }
      break;
    }

    case 'open-profile': {
      const id = el.dataset.id ?? null;
      state.selectedProfileId = id;
      state.globalSearchOpen = false;
      render();
      break;
    }

    case 'close-profile':
      state.selectedProfileId = null;
      render();
      break;

    case 'toggle-connect': {
      const alum = state.alumni.find((a) => a.id === el.dataset.id);
      if (!alum) break;
      if (alum.connected) {
        showToast(`Already connected with ${alum.name}`);
      } else if (alum.connectionPending) {
        alum.connectionPending = false;
        showToast(`Connection request to ${alum.name} withdrawn`);
      } else {
        alum.connectionPending = true;
        showToast(`Connection request sent to ${alum.name}`);
      }
      render();
      break;
    }

    // --- Home Feed ---
    case 'set-composer-type': {
      const val = el.dataset.value as AppState['composerType'] | undefined;
      if (val) {
        state.composerType = val;
        render();
      }
      break;
    }

    case 'set-composer-milestone': {
      const val = el.dataset.value;
      if (val) {
        state.composerMilestone = val;
        render();
      }
      break;
    }

    case 'set-feed-filter': {
      const val = el.dataset.value as AppState['feedFilter'] | undefined;
      if (val) {
        state.feedFilter = val;
        render();
      }
      break;
    }

    case 'vote-poll': {
      const postId = el.dataset.postId;
      const optionId = el.dataset.optionId;
      const post = state.posts.find((p) => p.id === postId);
      if (!post?.poll || !optionId) break;
      if (post.poll.votedOptionId === optionId) break;

      if (post.poll.votedOptionId) {
        const prev = post.poll.options.find((o) => o.id === post.poll?.votedOptionId);
        if (prev && prev.votes > 0) prev.votes -= 1;
      }
      const nextOpt = post.poll.options.find((o) => o.id === optionId);
      if (nextOpt) {
        nextOpt.votes += 1;
        post.poll.votedOptionId = optionId;
        showToast('Poll vote recorded');
        render();
      }
      break;
    }

    case 'toggle-like': {
      const post = state.posts.find((p) => p.id === el.dataset.id);
      if (!post) break;
      post.likedByMe = !post.likedByMe;
      post.likes += post.likedByMe ? 1 : -1;
      render();
      break;
    }

    case 'toggle-bookmark': {
      const post = state.posts.find((p) => p.id === el.dataset.id);
      if (!post) break;
      post.bookmarked = !post.bookmarked;
      showToast(post.bookmarked ? 'Saved post to bookmarks' : 'Removed from bookmarks');
      render();
      break;
    }

    case 'toggle-comments': {
      const id = el.dataset.id;
      if (!id) break;
      state.openComments[id] = !state.openComments[id];
      render();
      break;
    }

    // --- Smart Alumni Directory ---
    case 'set-dir-view': {
      const val = el.dataset.value as 'grid' | 'map' | undefined;
      if (val) {
        state.dirViewMode = val;
        render();
      }
      break;
    }

    case 'toggle-dir-opento': {
      const tag = el.dataset.value as OpenToTag | undefined;
      if (!tag) break;
      if (state.dirOpenTo.includes(tag)) {
        state.dirOpenTo = state.dirOpenTo.filter((t) => t !== tag);
      } else {
        state.dirOpenTo = [...state.dirOpenTo, tag];
      }
      render();
      break;
    }

    case 'reset-dir-filters':
      state.dirQuery = '';
      state.dirBatch = 'all';
      state.dirDept = 'all';
      state.dirCity = 'all';
      state.dirIndustry = 'all';
      state.dirCompany = 'all';
      state.dirOpenTo = [];
      state.dirMapCity = null;
      render();
      break;

    case 'set-map-city': {
      const val = el.dataset.value ?? '';
      state.dirMapCity = val || null;
      render();
      break;
    }

    // --- Chapters & Batch Groups ---
    case 'set-group-tab': {
      const val = el.dataset.value as AppState['groupTab'] | undefined;
      if (val) {
        state.groupTab = val;
        render();
      }
      break;
    }

    case 'open-group':
      state.selectedGroupId = el.dataset.id ?? null;
      state.groupSubTab = 'feed';
      render();
      break;

    case 'close-group':
      state.selectedGroupId = null;
      render();
      break;

    case 'set-group-subtab': {
      const val = el.dataset.value as AppState['groupSubTab'] | undefined;
      if (val) {
        state.groupSubTab = val;
        render();
      }
      break;
    }

    case 'toggle-join-group': {
      const group = state.groups.find((g) => g.id === el.dataset.id);
      if (!group) break;
      group.joined = !group.joined;
      group.memberCount += group.joined ? 1 : -1;
      showToast(group.joined ? `Joined ${group.name}` : `Left ${group.name}`);
      render();
      break;
    }

    // --- Jobs & Referrals ---
    case 'set-job-type':
      state.jobType = el.dataset.value ?? 'all';
      render();
      break;

    case 'reset-job-filters':
      state.jobQuery = '';
      state.jobType = 'all';
      state.jobReferralOnly = false;
      render();
      break;

    case 'open-job-detail':
      state.selectedJobId = el.dataset.id ?? null;
      render();
      break;

    case 'close-job-detail':
      state.selectedJobId = null;
      render();
      break;

    case 'open-post-job':
      state.postJobModalOpen = true;
      render();
      break;

    case 'close-post-job':
      state.postJobModalOpen = false;
      render();
      break;

    // --- Mentorship Hub ---
    case 'set-mentor-exp':
      state.mentorExpertise = el.dataset.value ?? 'All Topics';
      render();
      break;

    case 'open-book-mentor': {
      const mentorId = el.dataset.mentorId ?? null;
      const slotId = el.dataset.slotId ?? '';
      state.bookingMentorId = mentorId;
      state.bookingSlotId = slotId;
      render();
      break;
    }

    case 'close-book-mentor':
      state.bookingMentorId = null;
      state.bookingSlotId = '';
      render();
      break;

    case 'select-booking-slot':
      state.bookingSlotId = el.dataset.value ?? '';
      render();
      break;

    // --- Events & Reunions ---
    case 'set-event-cat':
      state.eventCategory = el.dataset.value ?? 'all';
      render();
      break;

    case 'rsvp-event': {
      const ev = state.events.find((e) => e.id === el.dataset.id);
      if (!ev) break;
      if (!ev.rsvped) {
        ev.rsvped = true;
        ev.rsvpCount += 1;
        ev.passCode = `ALMA-${ev.institutionId.slice(0, 3).toUpperCase()}-${Math.floor(
          1000 + Math.random() * 8999
        )}`;
        if (!ev.attendeeInitials.includes('RS')) {
          ev.attendeeInitials.unshift('RS');
        }
        showToast(`RSVP confirmed! QR entry pass generated for ${ev.title}`);
      }
      state.ticketEventId = ev.id;
      render();
      break;
    }

    case 'close-ticket-modal':
      state.ticketEventId = null;
      render();
      break;

    case 'download-ics': {
      const ev = state.events.find((e) => e.id === el.dataset.id);
      if (!ev) break;
      downloadEventIcs({
        id: ev.id,
        dateIso: ev.dateIso,
        title: ev.title,
        location: ev.location,
        description: ev.description,
        passCode: ev.passCode,
      });
      showToast('Calendar invite (.ics) downloaded');
      render();
      break;
    }

    // --- Business Directory ---
    case 'set-biz-cat':
      state.bizCategory = el.dataset.value ?? 'All';
      render();
      break;

    case 'copy-discount': {
      const biz = state.businesses.find((b) => b.id === el.dataset.id);
      if (!biz) break;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(biz.discountCode).catch(() => {});
      }
      state.copiedBizId = biz.id;
      showToast(`Copied alumni perk code ${biz.discountCode} for ${biz.name}`);
      if (copyResetTimer !== null) window.clearTimeout(copyResetTimer);
      copyResetTimer = window.setTimeout(() => {
        state.copiedBizId = null;
        copyResetTimer = null;
        render();
      }, 2200);
      render();
      break;
    }

    case 'open-add-biz':
      state.addBizModalOpen = true;
      render();
      break;

    case 'close-add-biz':
      state.addBizModalOpen = false;
      render();
      break;

    // --- Giving & Campaigns ---
    case 'open-donate':
      state.donateCampaignId = el.dataset.id ?? null;
      state.donateAmount = 15000;
      state.donateAnonymous = false;
      state.donateReceipt = null;
      render();
      break;

    case 'close-donate':
      state.donateCampaignId = null;
      state.donateReceipt = null;
      render();
      break;

    case 'set-donate-amt': {
      const amt = Number(el.dataset.value);
      if (!Number.isNaN(amt) && amt > 0) {
        state.donateAmount = amt;
        render();
      }
      break;
    }

    // --- Digital Alumni ID Card ---
    case 'set-id-inst': {
      const id = el.dataset.value;
      if (id) {
        state.idCardInstId = id;
        state.idCardFlipped = false;
        render();
      }
      break;
    }

    case 'flip-id-card':
      state.idCardFlipped = !state.idCardFlipped;
      render();
      break;

    // --- Institutional Admin Portal ---
    case 'set-admin-tab': {
      const val = el.dataset.value as AppState['adminTab'] | undefined;
      if (val) {
        state.adminTab = val;
        render();
      }
      break;
    }

    case 'set-admin-filter': {
      const val = el.dataset.value as AppState['adminStatusFilter'] | undefined;
      if (val) {
        state.adminStatusFilter = val;
        render();
      }
      break;
    }

    case 'approve-verif': {
      const req = state.verificationRequests.find((r) => r.id === el.dataset.id);
      if (!req || req.status !== 'pending') break;
      req.status = 'approved';
      const inst = state.institutions.find((i) => i.id === req.institutionId);
      if (inst) inst.verifiedCount += 1;
      showToast(`Approved ${req.applicantName} (${req.rollNumber}) as verified alumnus`);
      render();
      break;
    }

    case 'reject-verif': {
      const req = state.verificationRequests.find((r) => r.id === el.dataset.id);
      if (!req || req.status !== 'pending') break;
      req.status = 'rejected';
      showToast(`Rejected verification request for ${req.applicantName}`);
      render();
      break;
    }

    // --- Add Alma Mater Verification Wizard ---
    case 'open-add-campus':
      closeAllDropdowns();
      state.mobileMenuOpen = false;
      resetAddCampusWizard();
      state.addCampusOpen = true;
      render();
      break;

    case 'close-add-campus':
      state.addCampusOpen = false;
      render();
      break;

    case 'pick-campus-preset': {
      state.addCampusName = el.dataset.name ?? '';
      state.addCampusType = (el.dataset.type as Institution['type']) ?? 'University';
      state.addCampusLocation = el.dataset.loc ?? '';
      const domain = el.dataset.domain ?? 'edu.in';
      state.addCampusEmail = `rohan.sharma@alumni.${domain}`;
      if (!state.addCampusDegree) {
        state.addCampusDegree =
          state.addCampusType === 'High School'
            ? 'Senior Secondary'
            : state.addCampusType === 'Business School'
            ? 'Executive Management'
            : 'Executive Fellowship';
      }
      if (!state.addCampusDept) {
        state.addCampusDept = 'Computer Science & Strategy';
      }
      render();
      break;
    }

    case 'set-campus-method': {
      const method = el.dataset.value as AppState['addCampusMethod'] | undefined;
      if (method) {
        state.addCampusMethod = method;
        render();
      }
      break;
    }

    case 'send-campus-otp':
      state.addCampusOtpSent = true;
      state.addCampusOtpCode = '482916';
      showToast(`6-digit verification code sent to ${state.addCampusEmail}`);
      render();
      break;

    case 'verify-campus-roll':
      if (state.addCampusRoll.trim().length >= 4) {
        state.addCampusRollVerified = true;
        showToast('Registrar roll number record matched');
        render();
      }
      break;

    case 'confirm-campus-peer':
      state.addCampusPeerConfirmed = true;
      showToast('2/2 verified classmates vouched for your graduation cohort');
      render();
      break;

    case 'campus-back':
      state.addCampusStep = 1;
      render();
      break;

    case 'complete-add-campus': {
      const slug =
        state.addCampusName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `campus-${Date.now()}`;
      const id = state.institutions.some((i) => i.id === slug) ? `${slug}-${Date.now()}` : slug;
      const batchYear = Number(state.addCampusBatch) || 2024;
      const shortName =
        state.addCampusName.length <= 16
          ? state.addCampusName
          : state.addCampusName.split(' ').slice(0, 2).join(' ');

      const newInst: Institution = {
        id,
        name: state.addCampusName.trim() || 'New Institution',
        shortName,
        type: state.addCampusType,
        location: state.addCampusLocation.trim() || 'India',
        foundedYear: 1961,
        motto: 'Knowledge, Craft & Fellowship',
        bannerUrl: UNIFIED_BANNER_URL,
        crestVariant: 'columns',
        theme: {
          primary: '#7C2D12',
          primaryHover: '#66240E',
          secondary: '#B45309',
          softBg: '#FFF7ED',
          softBorder: '#FED7AA',
          textAccent: '#9A3412',
          gradientFrom: '#431407',
          gradientTo: '#9A3412',
        },
        verifiedCount: 14280,
        activeBatchRate: 81,
        userCredential: {
          degree: state.addCampusDegree.trim() || 'Alumni Fellow',
          department: state.addCampusDept.trim() || 'General Studies',
          batchYear,
          rollNumber:
            state.addCampusMethod === 'roll'
              ? state.addCampusRoll.trim()
              : `${shortName.slice(0, 3).toUpperCase()}-${batchYear}-0412`,
          verificationMethod:
            state.addCampusMethod === 'email'
              ? 'Official Email'
              : state.addCampusMethod === 'roll'
              ? 'Roll Number Registry'
              : 'Peer Vouched',
          verifiedSince: 'Nov 2026',
          campusAccessCode: `${shortName.slice(0, 3).toUpperCase()}-${String(batchYear).slice(
            -2
          )}-VRF`,
        },
      };

      state.institutions.push(newInst);
      state.activeWorkspace = newInst.id;
      state.idCardInstId = newInst.id;
      state.adminInstId = newInst.id;
      state.composerInstId = newInst.id;
      state.addCampusStep = 3;
      showToast(`${newInst.name} verified and added to your AlmaOne identity`);
      render();
      break;
    }

    case 'dismiss-toast':
      state.toast = null;
      if (toastTimer !== null) {
        window.clearTimeout(toastTimer);
        toastTimer = null;
      }
      render();
      break;
  }
}

function handleFormSubmit(formType: string, form: HTMLFormElement): void {
  const fd = new FormData(form);

  switch (formType) {
    case 'create-post': {
      const content = String(fd.get('content') ?? '').trim();
      const title = String(fd.get('title') ?? '').trim();
      if (!content) return;

      const targetInstId =
        state.activeWorkspace === 'all'
          ? String(fd.get('institutionId') ?? state.composerInstId)
          : state.activeWorkspace;
      const inst = state.institutions.find((i) => i.id === targetInstId) ?? state.institutions[0];

      const newPost: FeedPost = {
        id: `post-${Date.now()}`,
        institutionId: inst.id,
        authorId: state.user.id,
        authorName: state.user.name,
        authorInitials: 'RS',
        authorAvatarUrl: state.user.avatarUrl,
        authorTone: '#1E293B',
        authorRole: `${state.user.role} at ${state.user.company}`,
        authorCredentialLabel: `${inst.shortName} ’${String(inst.userCredential.batchYear).slice(-2)}`,
        type: state.composerType,
        milestoneLabel: state.composerType === 'milestone' ? state.composerMilestone : undefined,
        title: title || undefined,
        content,
        timestamp: 'Just now',
        likes: 1,
        likedByMe: true,
        bookmarked: false,
        comments: [],
      };

      state.posts.unshift(newPost);
      state.composerTitle = '';
      state.composerContent = '';
      showToast(`Published to ${inst.shortName} feed`);
      render();
      break;
    }

    case 'add-comment': {
      const postId = form.dataset.postId;
      const text = String(fd.get('comment') ?? '').trim();
      const post = state.posts.find((p) => p.id === postId);
      if (!post || !text) return;

      post.comments.push({
        id: `c-${Date.now()}`,
        authorName: state.user.name,
        authorInitials: 'RS',
        authorMeta: 'NIT Warangal ’18 · ISB ’22',
        content: text,
        timestamp: 'Just now',
      });
      state.openComments[post.id] = true;
      render();
      break;
    }

    case 'group-post': {
      const groupId = form.dataset.groupId;
      const content = String(fd.get('content') ?? '').trim();
      const group = state.groups.find((g) => g.id === groupId);
      if (!group || !content) return;

      group.posts.unshift({
        id: `gm-${Date.now()}`,
        authorName: state.user.name,
        authorInitials: 'RS',
        authorTone: '#1E293B',
        authorRole: `${state.user.role} · ${state.user.company}`,
        content,
        timestamp: 'Just now',
        likes: 1,
      });
      group.recentActivity = 'Active just now';
      showToast(`Posted to ${group.name}`);
      render();
      break;
    }

    case 'group-reply': {
      const groupId = form.dataset.groupId;
      const discId = form.dataset.discussionId;
      const reply = String(fd.get('reply') ?? '').trim();
      const group = state.groups.find((g) => g.id === groupId);
      const disc = group?.discussions.find((d) => d.id === discId);
      if (!disc || !reply) return;

      disc.replies.push({
        id: `dr-${Date.now()}`,
        authorName: state.user.name,
        content: reply,
        timestamp: 'Just now',
      });
      render();
      break;
    }

    case 'request-referral': {
      const jobId = form.dataset.jobId;
      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return;
      job.referralRequested = true;
      job.applicantsCount += 1;
      state.selectedJobId = null;
      showToast(`Direct referral request sent to ${job.postedByName} at ${job.company}`);
      render();
      break;
    }

    case 'post-job': {
      const title = String(fd.get('title') ?? '').trim();
      const company = String(fd.get('company') ?? '').trim();
      const description = String(fd.get('description') ?? '').trim();
      if (!title || !company || !description) return;

      const instId = String(fd.get('institutionId') ?? state.institutions[0].id);
      const inst = state.institutions.find((i) => i.id === instId) ?? state.institutions[0];

      const newJob: JobListing = {
        id: `job-${Date.now()}`,
        title,
        company,
        location: String(fd.get('location') ?? 'Bengaluru, India').trim(),
        workMode: (fd.get('workMode') as JobListing['workMode']) || 'Hybrid',
        employmentType: (fd.get('employmentType') as JobListing['employmentType']) || 'Full-time',
        experienceLevel: String(fd.get('experienceLevel') ?? '4–7 years').trim(),
        compensation: String(fd.get('compensation') ?? 'Competitive + Equity').trim(),
        institutionId: inst.id,
        postedById: state.user.id,
        postedByName: state.user.name,
        postedByRole: `${state.user.role} at ${state.user.company}`,
        postedByBatch: `${inst.shortName} ’${String(inst.userCredential.batchYear).slice(-2)}`,
        postedAt: 'Just now',
        directReferral: fd.get('directReferral') === 'on',
        description,
        requirements: [
          'Strong track record shipping high-impact products or systems',
          'Verified AlmaOne network referral fast-tracks hiring manager review',
        ],
        applicantsCount: 0,
      };

      state.jobs.unshift(newJob);
      state.postJobModalOpen = false;
      showToast(`Published "${newJob.title}" at ${newJob.company}`);
      render();
      break;
    }

    case 'book-mentor': {
      const mentorId = form.dataset.mentorId;
      const mentor = state.mentors.find((m) => m.id === mentorId);
      const slot = mentor?.slots.find((s) => s.id === state.bookingSlotId && !s.booked);
      if (!mentor || !slot) {
        showToast('Please select an available 30-minute slot');
        render();
        return;
      }

      const topic = String(fd.get('topic') ?? mentor.expertise[0] ?? 'Career Strategy');
      const notes = String(fd.get('notes') ?? '').trim();

      slot.booked = true;
      mentor.sessionsCompleted += 1;
      state.bookedSessions.unshift({
        id: `bs-${Date.now()}`,
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorRole: `${mentor.role} · ${mentor.company}`,
        dateLabel: slot.dateLabel,
        timeLabel: slot.timeLabel,
        topic,
        notes,
      });
      state.bookingMentorId = null;
      state.bookingSlotId = '';
      showToast(`Booked 30-min session with ${mentor.name} (${slot.dateLabel})`);
      render();
      break;
    }

    case 'add-biz': {
      const name = String(fd.get('name') ?? '').trim();
      const tagline = String(fd.get('tagline') ?? '').trim();
      if (!name || !tagline) return;

      const instId = String(fd.get('institutionId') ?? state.institutions[0].id);
      const inst = state.institutions.find((i) => i.id === instId) ?? state.institutions[0];

      const newBiz: AlumniBusiness = {
        id: `biz-${Date.now()}`,
        name,
        tagline,
        category: (fd.get('category') as AlumniBusiness['category']) || 'SaaS & AI',
        institutionId: inst.id,
        founderId: state.user.id,
        founderName: state.user.name,
        founderBatch: `${inst.shortName} ’${String(inst.userCredential.batchYear).slice(-2)}`,
        city: String(fd.get('city') ?? 'Bengaluru').trim(),
        website: String(fd.get('website') ?? 'venture.example.com').trim(),
        discountCode: String(fd.get('discountCode') ?? 'ALMA20').trim().toUpperCase(),
        discountOffer: String(
          fd.get('discountOffer') ?? '20% off annual plans for verified alumni'
        ).trim(),
        description: `${tagline}. Founded by ${state.user.name} and verified through the AlmaOne Alumni Network.`,
      };

      state.businesses.unshift(newBiz);
      state.addBizModalOpen = false;
      showToast(`Listed ${newBiz.name} in the Alumni Business Directory`);
      render();
      break;
    }

    case 'donate': {
      const campaignId = form.dataset.campaignId;
      const camp = state.campaigns.find((c) => c.id === campaignId);
      if (!camp) return;

      const amount = Math.max(500, Number(fd.get('amount')) || state.donateAmount);
      const anonymous = fd.get('anonymous') === 'on';
      state.donateAmount = amount;
      state.donateAnonymous = anonymous;

      camp.raisedAmountInr += amount;
      camp.donorCount += 1;

      const inst = state.institutions.find((i) => i.id === camp.institutionId);
      const batchYear = inst?.userCredential.batchYear;
      const boardEntry = state.leaderboard.find(
        (b) => b.institutionId === camp.institutionId && b.batchYear === batchYear
      );
      if (boardEntry) {
        boardEntry.totalRaisedInr += amount;
        boardEntry.donorsCount += 1;
        boardEntry.participationPct = Math.min(99.5, boardEntry.participationPct + 0.6);
      }

      state.donateReceipt = `80G-ALMA-${Math.floor(100000 + Math.random() * 899999)}`;
      showToast(`Contribution of ₹${amount.toLocaleString('en-IN')} recorded`);
      render();
      break;
    }

    case 'send-broadcast': {
      const title = state.bcTitle.trim();
      const body = state.bcBody.trim();
      if (!title || !body) return;

      const inst =
        state.institutions.find((i) => i.id === state.adminInstId) ?? state.institutions[0];
      let estReach = inst.verifiedCount;
      if (state.bcBatch !== 'All Batches') estReach = Math.round(estReach * 0.28);
      if (state.bcDept !== 'All Departments') estReach = Math.round(estReach * 0.34);
      if (state.bcCity !== 'All Cities') estReach = Math.round(estReach * 0.24);
      estReach = Math.max(48, estReach);

      state.broadcasts.unshift({
        id: `bc-${Date.now()}`,
        institutionId: inst.id,
        title,
        body,
        targetBatch: state.bcBatch,
        targetDepartment: state.bcDept,
        targetCity: state.bcCity,
        estimatedReach: estReach,
        sentAt: 'Just now',
      });

      state.posts.unshift({
        id: `post-bc-${Date.now()}`,
        institutionId: inst.id,
        authorId: `office-${inst.id}`,
        authorName: `${inst.name} Alumni Office`,
        authorInitials: inst.shortName.slice(0, 2).toUpperCase(),
        authorTone: inst.theme.primary,
        authorRole: 'Official Institutional Broadcast',
        authorCredentialLabel: inst.shortName,
        type: 'announcement',
        title,
        content: body,
        timestamp: 'Just now',
        likes: 0,
        likedByMe: false,
        bookmarked: false,
        comments: [],
        isOfficialBroadcast: true,
        broadcastSegment: `${state.bcBatch} · ${state.bcCity}`,
      });

      state.bcTitle = '';
      state.bcBody = '';
      showToast(`Broadcast dispatched to ${estReach.toLocaleString('en-IN')} verified alumni`);
      render();
      break;
    }

    case 'send-dm': {
      const threadId = form.dataset.threadId;
      const text = String(fd.get('message') ?? '').trim();
      const thread = state.threads.find((t) => t.id === threadId);
      if (!thread || !text) return;

      thread.messages.push({
        id: `m-${Date.now()}`,
        sender: 'me',
        text,
        timestamp: 'Just now',
      });
      render();
      break;
    }

    case 'add-campus-step1': {
      const name = String(fd.get('name') ?? '').trim();
      const degree = String(fd.get('degree') ?? '').trim();
      if (!name || !degree) return;

      state.addCampusName = name;
      state.addCampusType = (fd.get('type') as Institution['type']) || 'University';
      state.addCampusDegree = degree;
      state.addCampusBatch = String(fd.get('batch') ?? '2024').trim();
      state.addCampusDept = String(fd.get('dept') ?? '').trim();
      state.addCampusLocation = String(fd.get('location') ?? '').trim();
      state.addCampusStep = 2;
      render();
      break;
    }
  }
}

// ============================================================================
// DELEGATED EVENT LISTENERS (ZERO REACT — PURE TYPESCRIPT + TAILWIND CSS)
// ============================================================================

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const actionEl = target.closest<HTMLElement>('[data-action]');
  if (actionEl) {
    // If clicking inside a modal/drawer panel (marked data-stop-prop="true")
    // do not bubble up to the backdrop's close-* action.
    const stopEl = target.closest<HTMLElement>('[data-stop-prop="true"]');
    if (stopEl && actionEl.contains(stopEl) && actionEl !== stopEl) {
      return;
    }
    const action = actionEl.dataset.action;
    if (action) {
      handleAction(action, actionEl);
    }
    return;
  }

  // Click outside open header dropdowns closes them cleanly
  if (!target.closest('[data-stop-prop="true"]')) {
    if (closeAllDropdowns()) {
      render();
    }
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target as HTMLFormElement | null;
  if (!form || !form.dataset.form) return;
  event.preventDefault();
  handleFormSubmit(form.dataset.form, form);
});

document.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  if (!target) return;

  // Keep feed composer drafts synced so switching Update/Question/Milestone preserves typed text
  const parentForm = target.form?.dataset.form;
  if (parentForm === 'create-post') {
    if (target.name === 'title') state.composerTitle = target.value;
    if (target.name === 'content') state.composerContent = target.value;
    return;
  }

  const key = target.dataset.input;
  if (!key) return;

  switch (key) {
    case 'globalSearch':
      state.globalSearch = target.value;
      state.globalSearchOpen = true;
      render();
      break;
    case 'dirQuery':
      state.dirQuery = target.value;
      render();
      break;
    case 'jobQuery':
      state.jobQuery = target.value;
      render();
      break;
    case 'bizQuery':
      state.bizQuery = target.value;
      render();
      break;
    case 'bcTitle':
      state.bcTitle = target.value;
      render();
      break;
    case 'bcBody':
      state.bcBody = target.value;
      render();
      break;
    case 'addCampusEmail':
      state.addCampusEmail = target.value;
      break;
    case 'addCampusOtpCode':
      state.addCampusOtpCode = target.value;
      render();
      break;
    case 'addCampusRoll':
      state.addCampusRoll = target.value;
      state.addCampusRollVerified = false;
      render();
      break;
  }
});

document.addEventListener('change', (event) => {
  const target = event.target as HTMLSelectElement | HTMLInputElement | null;
  if (!target) return;

  const selectKey = target.dataset.select;
  if (selectKey && target instanceof HTMLSelectElement) {
    switch (selectKey) {
      case 'dirBatch':
        state.dirBatch = target.value;
        break;
      case 'dirDept':
        state.dirDept = target.value;
        break;
      case 'dirCity':
        state.dirCity = target.value;
        break;
      case 'dirIndustry':
        state.dirIndustry = target.value;
        break;
      case 'dirCompany':
        state.dirCompany = target.value;
        break;
      case 'adminInstId':
        state.adminInstId = target.value;
        break;
      case 'bcBatch':
        state.bcBatch = target.value;
        break;
      case 'bcDept':
        state.bcDept = target.value;
        break;
      case 'bcCity':
        state.bcCity = target.value;
        break;
    }
    render();
    return;
  }

  const checkboxKey = target.dataset.checkbox;
  if (checkboxKey === 'jobReferralOnly' && target instanceof HTMLInputElement) {
    state.jobReferralOnly = target.checked;
    render();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    let changed = closeAllDropdowns();
    if (state.mobileMenuOpen) {
      state.mobileMenuOpen = false;
      changed = true;
    }
    if (state.selectedProfileId) {
      state.selectedProfileId = null;
      changed = true;
    }
    if (state.messagesOpen) {
      state.messagesOpen = false;
      changed = true;
    }
    if (state.selectedJobId) {
      state.selectedJobId = null;
      changed = true;
    }
    if (state.postJobModalOpen) {
      state.postJobModalOpen = false;
      changed = true;
    }
    if (state.bookingMentorId) {
      state.bookingMentorId = null;
      changed = true;
    }
    if (state.ticketEventId) {
      state.ticketEventId = null;
      changed = true;
    }
    if (state.addBizModalOpen) {
      state.addBizModalOpen = false;
      changed = true;
    }
    if (state.donateCampaignId) {
      state.donateCampaignId = null;
      changed = true;
    }
    if (state.addCampusOpen) {
      state.addCampusOpen = false;
      changed = true;
    }
    if (changed) render();
  } else if (
    (event.key === 'Enter' || event.key === ' ') &&
    (event.target as HTMLElement | null)?.dataset.action === 'flip-id-card'
  ) {
    event.preventDefault();
    state.idCardFlipped = !state.idCardFlipped;
    render();
  }
});

// Initial Boot
render();
