import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import {
  Alumnus,
  BookedMentorshipSession,
  InstitutionTheme,
  Mentor,
  WorkspaceId,
} from '../../types/alumni';
import { AlumniAvatar, EmptyState, ModalShell } from '../ui/CommonUI';

interface MentorshipViewProps {
  activeWorkspace: WorkspaceId;
  mentors: Mentor[];
  bookedSessions: BookedMentorshipSession[];
  alumni: Alumnus[];
  theme: InstitutionTheme;
  onBookSession: (payload: {
    mentorId: string;
    slotId: string;
    topic: string;
    notes: string;
  }) => void;
  onOpenAlumnus: (alumnus: Alumnus) => void;
}

const EXPERTISE_FILTERS = [
  'All Topics',
  'Product Management',
  'Higher Studies Abroad',
  'Startup Fundraising',
  'Software Engineering',
  'Consulting & Strategy',
];

export const MentorshipView: React.FC<MentorshipViewProps> = ({
  activeWorkspace,
  mentors,
  bookedSessions,
  alumni,
  theme,
  onBookSession,
  onOpenAlumnus,
}) => {
  const [selectedExpertise, setSelectedExpertise] = useState('All Topics');
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const matchesWorkspace = activeWorkspace === 'all' || m.institutionId === activeWorkspace;
      const matchesExpertise =
        selectedExpertise === 'All Topics' || m.expertise.includes(selectedExpertise);
      return matchesWorkspace && matchesExpertise;
    });
  }, [mentors, activeWorkspace, selectedExpertise]);

  const openBooking = (mentor: Mentor, preselectedSlotId?: string) => {
    const firstAvailable =
      preselectedSlotId ?? mentor.slots.find((s) => !s.booked)?.id ?? '';
    setBookingMentor(mentor);
    setSelectedSlotId(firstAvailable);
    setTopic(mentor.expertise[0] ?? 'Career Guidance');
    setNotes('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor || !selectedSlotId) return;
    onBookSession({
      mentorId: bookingMentor.id,
      slotId: selectedSlotId,
      topic: topic.trim() || '30-min Mentorship Session',
      notes: notes.trim(),
    });
    setBookingMentor(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mentorship Hub</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Book 1-on-1 30-minute career, admissions, and founder sessions with verified alumni mentors
        </p>
      </div>

      {/* Upcoming Booked Sessions Banner */}
      {bookedSessions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-900">
              Your Confirmed Upcoming Sessions ({bookedSessions.length})
            </h2>
            <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Calendar Invites Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookedSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {sess.mentorName} · {sess.topic}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {sess.mentorRole}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
                    {sess.dateLabel}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {sess.timeLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expertise Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {EXPERTISE_FILTERS.map((exp) => (
          <button
            key={exp}
            type="button"
            onClick={() => setSelectedExpertise(exp)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedExpertise === exp
                ? 'text-white border-transparent'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
            style={selectedExpertise === exp ? { backgroundColor: theme.primary } : undefined}
          >
            {exp}
          </button>
        ))}
      </div>

      {/* Mentor Grid */}
      {filteredMentors.length === 0 ? (
        <EmptyState
          title="No mentors found for this filter"
          description="Try selecting All Topics or switching to All Alma Maters to browse mentors across all campuses."
          actionLabel="Show All Topics"
          onAction={() => setSelectedExpertise('All Topics')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMentors.map((mentor) => {
            const matchedAlum = alumni.find((a) => a.id === mentor.alumnusId);
            const openSlots = mentor.slots.filter((s) => !s.booked);
            return (
              <div
                key={mentor.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => matchedAlum && onOpenAlumnus(matchedAlum)}
                      className="flex items-start gap-3 text-left group min-w-0"
                    >
                      <AlumniAvatar
                        name={mentor.name}
                        initials={mentor.initials}
                        tone={mentor.avatarTone}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:underline truncate">
                          {mentor.name}
                        </h3>
                        <p className="text-xs text-slate-700 truncate">
                          {mentor.role} · <span className="font-medium">{mentor.company}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {mentor.credentialLabel} ·{' '}
                          <span className="tabular-nums">
                            {mentor.sessionsCompleted} sessions completed
                          </span>
                        </p>
                      </div>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{mentor.bio}</p>

                  {/* Unboxed expertise metadata */}
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Focus areas: </span>
                    {mentor.expertise.join(' · ')}
                  </div>

                  {/* Available Monthly Slots */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">
                        Upcoming 30-min Availability
                      </span>
                      <span>{mentor.responseTime}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mentor.slots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={slot.booked}
                          onClick={() => openBooking(mentor, slot.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono tabular-nums transition-colors whitespace-nowrap ${
                            slot.booked
                              ? 'border-slate-100 bg-slate-50 text-slate-400 line-through cursor-not-allowed'
                              : 'border-slate-200 bg-white hover:border-slate-400 text-slate-800'
                          }`}
                        >
                          {slot.dateLabel} · {slot.timeLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {openSlots.length} {openSlots.length === 1 ? 'slot' : 'slots'} open this month
                  </span>
                  <button
                    type="button"
                    disabled={openSlots.length === 0}
                    onClick={() => openBooking(mentor)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-40 whitespace-nowrap"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {openSlots.length > 0 ? 'Schedule 30-Min Session' : 'Fully Booked'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      <ModalShell
        open={!!bookingMentor}
        onClose={() => setBookingMentor(null)}
        title={`Schedule 30-Min Mentorship with ${bookingMentor?.name ?? ''}`}
        subtitle={bookingMentor ? `${bookingMentor.role} at ${bookingMentor.company}` : ''}
      >
        {bookingMentor && (
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Select an available 30-minute slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bookingMentor.slots
                  .filter((s) => !s.booked)
                  .map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedSlotId === slot.id
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 font-mono tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {slot.dateLabel}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                        <Clock className="w-3 h-3" />
                        {slot.timeLabel} (30 mins)
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Session Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
              >
                {bookingMentor.expertise.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
                <option value="General Career Advice">General Career Advice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Context & Questions for {bookingMentor.name.split(' ')[0]}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share 2–3 specific questions so your mentor can prepare..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookingMentor(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSlotId}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: theme.primary }}
              >
                Confirm Booking
              </button>
            </div>
          </form>
        )}
      </ModalShell>
    </div>
  );
};
