@extends('layouts.app')

@section('title', 'Home Feed · AlmaOne')

@section('content')
<div class="space-y-6">
    {{-- Institutional Campus Hero Banner --}}
    <section class="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 min-h-[220px] flex items-end p-6 sm:p-8">
        <div class="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-stone-950/15"></div>
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
            <div class="space-y-1.5 max-w-2xl">
                <p class="text-xs text-stone-200/90">Unified Network · Verified Multi-Institution Workspace</p>
                <h1 class="font-serif text-3xl font-semibold text-white tracking-tight">All Alma Maters — Unified Feed</h1>
                <p class="text-sm text-stone-200/90">Rohan Sharma · St. Xavier's ’14 · NIT Warangal ’18 · ISB Hyderabad ’22</p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <a href="{{ route('id-card') }}" class="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-semibold text-white whitespace-nowrap">View Alumni ID</a>
                <a href="{{ route('directory') }}" class="px-4 py-2 rounded-lg bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold whitespace-nowrap">Explore Directory</a>
            </div>
        </div>
    </section>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div class="xl:col-span-8 space-y-5">
            <form method="POST" action="{{ route('posts.store') }}" class="bg-white border border-stone-200 rounded-2xl p-5 space-y-3.5">
                @csrf
                <input type="hidden" name="type" value="update" />
                <input type="text" name="title" placeholder="Share a milestone, announcement, or question..."
                       class="w-full h-10 px-3.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400" />
                <textarea name="content" rows="2" required placeholder="Write an update for your alumni community..."
                          class="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400 resize-none"></textarea>
                <div class="flex justify-end">
                    <button type="submit" class="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                        Publish Post
                    </button>
                </div>
            </form>
        </div>
        <aside class="xl:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
            <h2 class="text-sm font-semibold text-stone-900">Your Network Reach</h2>
            <div class="grid grid-cols-2 gap-4 font-mono tabular-nums">
                <div>
                    <div class="text-xl font-semibold text-stone-900">39,680</div>
                    <div class="text-xs font-sans text-stone-500">Verified Alumni</div>
                </div>
                <div>
                    <div class="text-xl font-semibold text-stone-900">78%</div>
                    <div class="text-xs font-sans text-stone-500">Batch Activation</div>
                </div>
            </div>
        </aside>
    </div>
</div>
@endsection
