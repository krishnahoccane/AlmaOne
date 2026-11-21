import React, { useState } from 'react';
import { Calendar, CheckCircle2, Download, MapPin, Ticket, Video } from 'lucide-react';
import {
  AlumniEvent,
  Institution,
  InstitutionTheme,
  UserProfile,
  WorkspaceId,
} from '../../types/alumni';
import { DeterministicQrCode, EmptyState, ModalShell } from '../ui/CommonUI';

interface EventsViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  events: AlumniEvent[];
  user: UserProfile;
  theme: InstitutionTheme;
  onRsvpEvent: (eventId: string) => AlumniEvent | undefined;
}

export const EventsView: React.FC<EventsViewProps> = ({
  activeWorkspace,
  institutions,
  events,
  user,
  theme,
  onRsvpEvent,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ticketEvent, setTicketEvent] = useState<AlumniEvent | null>(null);

  const visibleEvents = events.filter((ev) => {
    const matchesWorkspace = activeWorkspace === 'all' || ev.institutionId === activeWorkspace;
    const matchesCat = categoryFilter === 'all' || ev.category === categoryFilter;
    return matchesWorkspace && matchesCat;
  });

  const handleRsvpClick = (ev: AlumniEvent) => {
    if (ev.rsvped) {
      setTicketEvent(ev);
      return;
    }
    const updated = onRsvpEvent(ev.id);
    if (updated) {
      setTicketEvent(updated);
    }
  };

  const handleDownloadIcs = (ev: AlumniEvent) => {
    const cleanDate = ev.dateIso.replace(/-/g, '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AlmaOne//Alumni Events//EN',
      'BEGIN:VEVENT',
      `UID:${ev.id}@almaone.org`,
      `DTSTART:${cleanDate}T120000Z`,
      `DTEND:${cleanDate}T150000Z`,
      `SUMMARY:${ev.title}`,
      `LOCATION:${ev.location}`,
      `DESCRIPTION:${ev.description} | Entry Pass: ${ev.passCode ?? 'ALMA-PASS'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ev.id}-almaone.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Events & Milestone Reunions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            One-click RSVP with instant QR entry passes and calendar sync
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          {['all', 'Milestone Reunion', 'City Meetup', 'Virtual Webinar'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Events' : cat}
            </button>
          ))}
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <EmptyState
          title="No upcoming events match this filter"
          description="Switch to All Events or All Alma Maters to view cross-campus reunions and webinars."
          actionLabel="Show All Events"
          onAction={() => setCategoryFilter('all')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleEvents.map((ev) => {
            const inst = institutions.find((i) => i.id === ev.institutionId);
            const pctFull = Math.min(100, Math.round((ev.rsvpCount / ev.capacity) * 100));
            return (
              <div
                key={ev.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {ev.category} · {inst?.shortName ?? 'Alumni Network'}
                      {ev.milestoneBadge ? ` · ${ev.milestoneBadge}` : ''}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {ev.priceDisplay}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                  <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {ev.dateDisplay} · {ev.timeDisplay}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ev.isVirtual ? (
                        <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex -space-x-1.5">
                      {ev.attendeeInitials.slice(0, 4).map((init, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-slate-800 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
                        >
                          {init}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-slate-600 tabular-nums truncate">
                      <span className="font-semibold text-slate-900">{ev.rsvpCount}</span> /{' '}
                      {ev.capacity} attending ({pctFull}%)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRsvpClick(ev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                    style={
                      ev.rsvped
                        ? {
                            backgroundColor: '#ECFDF5',
                            color: '#065F46',
                            border: '1px solid #A7F3D0',
                          }
                        : {
                            backgroundColor: theme.primary,
                            color: '#FFFFFF',
                          }
                    }
                  >
                    {ev.rsvped ? (
                      <>
                        <Ticket className="w-3.5 h-3.5" />
                        View QR Pass
                      </>
                    ) : (
                      'One-Click RSVP'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Entry Pass Modal */}
      <ModalShell
        open={!!ticketEvent}
        onClose={() => setTicketEvent(null)}
        title="Confirmed Event Entry Pass"
        subtitle="Present this QR code at the campus check-in desk or event entrance."
        maxWidthClass="max-w-md"
      >
        {ticketEvent && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Registration confirmed for {user.name}
            </div>

            <div className="border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center space-y-4 bg-slate-50/40">
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  {institutions.find((i) => i.id === ticketEvent.institutionId)?.name ??
                    'AlmaOne Event'}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{ticketEvent.title}</h3>
                <p className="text-xs text-slate-600 mt-1">
                  {ticketEvent.dateDisplay} · {ticketEvent.timeDisplay}
                </p>
              </div>

              <DeterministicQrCode
                value={`${ticketEvent.passCode ?? ticketEvent.id}-${user.id}`}
                size={156}
              />

              <div className="w-full pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-left text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Attendee</div>
                  <div className="font-semibold text-slate-900">{user.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Pass ID</div>
                  <div className="font-mono font-semibold text-slate-900 tabular-nums">
                    {ticketEvent.passCode ?? 'ALMA-2026-901'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Ticket Tier</div>
                  <div className="font-medium text-slate-800">
                    Verified Alumnus ({ticketEvent.priceDisplay})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Venue</div>
                  <div className="font-medium text-slate-800 truncate">{ticketEvent.location}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDownloadIcs(ticketEvent)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800"
              >
                <Download className="w-3.5 h-3.5" />
                Add to Calendar (.ics)
              </button>
              <button
                type="button"
                onClick={() => setTicketEvent(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
};
