@extends('layouts.app')

@section('title', 'Institutional Admin Portal · AlmaOne')

@section('content')
<div class="space-y-6">
    <div class="bg-stone-900 text-white rounded-2xl p-6">
        <p class="text-xs text-stone-300">Institutional Admin Portal (B2B View)</p>
        <h1 class="font-serif text-2xl font-semibold mt-1">Alumni Office Verification & Broadcast Console</h1>
        <p class="text-xs text-stone-300 mt-1">Audit registrar roll number matches, peer vouches, cohort activation metrics, and segmented broadcasts.</p>
    </div>

    <form method="POST" action="{{ route('admin.broadcasts.send') }}" class="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 max-w-2xl">
        @csrf
        <h2 class="text-sm font-semibold text-stone-900">Segmented Broadcast Center</h2>
        <input type="text" name="title" required placeholder="Announcement Subject"
               class="w-full h-10 px-3.5 rounded-lg border border-stone-200 text-sm" />
        <textarea name="body" rows="4" required placeholder="Write official institutional update..."
                  class="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm"></textarea>
        <button type="submit" class="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold">
            Dispatch Broadcast
        </button>
    </form>
</div>
@endsection
