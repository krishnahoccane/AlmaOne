<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\View\View;

/**
 * AlmaOne Multi-Tenant Alumni Portal Controller ("1 App, 1 User").
 * Resolves the active institutional workspace (or Unified "all" mode) from session
 * and renders Blade views styled with Tailwind CSS and Alpine.js (zero React).
 */
class AlumniPortalController extends Controller
{
    private function activeWorkspace(Request $request): string
    {
        return (string) $request->session()->get('almaone.workspace', 'all');
    }

    public function switchWorkspace(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'workspace' => ['required', 'string', 'max:64'],
        ]);

        $request->session()->put('almaone.workspace', $validated['workspace']);

        return back()->with('status', 'Workspace switched successfully.');
    }

    public function verifyAndAttachInstitution(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', 'string', 'max:60'],
            'degree' => ['required', 'string', 'max:120'],
            'department' => ['required', 'string', 'max:120'],
            'batch_year' => ['required', 'integer', 'min:1960', 'max:2030'],
            'verification_method' => ['required', 'in:email,roll,peer'],
        ]);

        $slug = Str::slug($validated['name']);
        $request->session()->put('almaone.workspace', $slug);

        return redirect()
            ->route('feed')
            ->with('status', "{$validated['name']} verified and linked to your unified identity.");
    }

    public function updatePrivacy(Request $request): RedirectResponse
    {
        $privacy = $request->only([
            'show_email',
            'show_phone',
            'show_company',
            'allow_direct_messages',
            'searchable_in_directory',
        ]);

        $request->session()->put('almaone.privacy', $privacy);

        return back()->with('status', 'Privacy controls synced across all campuses.');
    }

    public function feed(Request $request): View
    {
        return view('pages.feed', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'feed',
        ]);
    }

    public function storePost(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:update,question,milestone'],
            'content' => ['required', 'string', 'max:2000'],
            'title' => ['nullable', 'string', 'max:180'],
        ]);

        return back()->with('status', 'Post published to your alumni feed.');
    }

    public function toggleLike(int $post): RedirectResponse
    {
        return back();
    }

    public function votePoll(Request $request, int $post): RedirectResponse
    {
        $request->validate(['option_id' => ['required', 'string']]);
        return back()->with('status', 'Poll vote recorded.');
    }

    public function storeComment(Request $request, int $post): RedirectResponse
    {
        $request->validate(['content' => ['required', 'string', 'max:800']]);
        return back()->with('status', 'Comment posted.');
    }

    public function directory(Request $request): View
    {
        return view('pages.directory', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'directory',
            'viewMode' => $request->query('view', 'grid'),
        ]);
    }

    public function toggleConnect(int $alumnus): RedirectResponse
    {
        return back()->with('status', 'Connection status updated.');
    }

    public function groups(Request $request): View
    {
        return view('pages.groups', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'groups',
        ]);
    }

    public function showGroup(Request $request, string $group): View
    {
        return view('pages.groups', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'groups',
            'selectedGroup' => $group,
        ]);
    }

    public function toggleJoinGroup(string $group): RedirectResponse
    {
        return back()->with('status', 'Group membership updated.');
    }

    public function jobs(Request $request): View
    {
        return view('pages.jobs', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'jobs',
        ]);
    }

    public function storeJob(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:140'],
            'company' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string'],
        ]);

        return back()->with('status', 'Alumni job opportunity published.');
    }

    public function requestReferral(Request $request, int $job): RedirectResponse
    {
        $request->validate([
            'note' => ['required', 'string', 'max:1200'],
        ]);

        return back()->with('status', 'Direct referral request sent to the verified alumnus.');
    }

    public function mentorship(Request $request): View
    {
        return view('pages.mentorship', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'mentorship',
        ]);
    }

    public function bookMentorship(Request $request): RedirectResponse
    {
        $request->validate([
            'mentor_id' => ['required', 'string'],
            'slot_id' => ['required', 'string'],
            'topic' => ['required', 'string', 'max:140'],
        ]);

        return back()->with('status', '30-minute mentorship session confirmed.');
    }

    public function events(Request $request): View
    {
        return view('pages.events', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'events',
        ]);
    }

    public function rsvpEvent(int $event): RedirectResponse
    {
        $passCode = 'ALMA-' . strtoupper(Str::random(6));
        return back()->with('status', "RSVP confirmed! Entry Pass {$passCode} generated.");
    }

    public function downloadIcs(string $event): Response
    {
        $ics = implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AlmaOne//Laravel Alumni Network//EN',
            'BEGIN:VEVENT',
            "UID:{$event}@almaone.org",
            'DTSTART:20261218T100000Z',
            'DTEND:20261218T130000Z',
            'SUMMARY:AlmaOne Alumni Event',
            'END:VEVENT',
            'END:VCALENDAR',
        ]);

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$event}.ics\"",
        ]);
    }

    public function businesses(Request $request): View
    {
        return view('pages.businesses', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'businesses',
        ]);
    }

    public function storeBusiness(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'tagline' => ['required', 'string', 'max:200'],
        ]);

        return back()->with('status', 'Venture listed in the Alumni Business Directory.');
    }

    public function giving(Request $request): View
    {
        return view('pages.giving', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'giving',
        ]);
    }

    public function storeDonation(Request $request): RedirectResponse
    {
        $request->validate([
            'campaign_id' => ['required', 'string'],
            'amount_inr' => ['required', 'integer', 'min:500'],
        ]);

        return back()->with('status', 'Thank you! Contribution credited to your batch leaderboard.');
    }

    public function digitalId(Request $request): View
    {
        return view('pages.id-card', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'id-card',
        ]);
    }

    public function adminPortal(Request $request): View
    {
        return view('pages.admin', [
            'workspace' => $this->activeWorkspace($request),
            'activeNav' => 'admin',
        ]);
    }

    public function approveVerification(int $request): RedirectResponse
    {
        return back()->with('status', 'Alumnus verification approved.');
    }

    public function rejectVerification(int $request): RedirectResponse
    {
        return back()->with('status', 'Alumnus verification rejected.');
    }

    public function sendBroadcast(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'body' => ['required', 'string', 'max:3000'],
        ]);

        return back()->with('status', 'Segmented campus broadcast dispatched to alumni.');
    }
}
