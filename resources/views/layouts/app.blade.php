<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@yield('title', 'AlmaOne — Unified Multi-Institution Alumni Network')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-[#F7F7F5] text-stone-900 antialiased selection:bg-stone-900 selection:text-white" x-data="{ mobileMenu: false, dmDrawer: false, addCampusModal: false }">
    <div class="min-h-screen flex">
        {{-- Persistent Left Sidebar Navigation --}}
        <aside class="hidden lg:flex flex-col w-[260px] shrink-0 h-screen sticky top-0 bg-white border-r border-stone-200/90">
            <div class="h-16 px-6 flex items-center gap-3 border-b border-stone-100">
                <span class="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-serif font-semibold text-base">A</span>
                <span class="font-serif font-semibold text-lg tracking-tight text-stone-900">AlmaOne</span>
            </div>

            <nav class="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 text-[13.5px]">
                @php
                    $navItems = [
                        ['route' => 'feed', 'label' => 'Home Feed'],
                        ['route' => 'directory', 'label' => 'Alumni Directory'],
                        ['route' => 'groups', 'label' => 'Chapters & Batch Groups'],
                        ['route' => 'jobs', 'label' => 'Jobs & Referrals'],
                        ['route' => 'mentorship', 'label' => 'Mentorship Hub'],
                        ['route' => 'events', 'label' => 'Events & Reunions'],
                        ['route' => 'businesses', 'label' => 'Business Directory'],
                        ['route' => 'giving', 'label' => 'Giving & Campaigns'],
                        ['route' => 'id-card', 'label' => 'Digital Alumni ID'],
                    ];
                @endphp

                @foreach ($navItems as $item)
                    <a href="{{ route($item['route']) }}"
                       class="flex items-center px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap {{ ($activeNav ?? '') === $item['route'] ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80' }}">
                        {{ $item['label'] }}
                    </a>
                @endforeach

                <div class="pt-4 mt-4 border-t border-stone-100">
                    <a href="{{ route('admin.index') }}"
                       class="flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap {{ ($activeNav ?? '') === 'admin' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100/80' }}">
                        <span>Admin Portal</span>
                        <span class="font-mono text-[11px] opacity-70">B2B</span>
                    </a>
                </div>
            </nav>

            <div class="p-4 border-t border-stone-100 bg-stone-50/70">
                <button type="button" @click="addCampusModal = true"
                        class="w-full py-2 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-800 transition-colors">
                    + Add Another School / College
                </button>
            </div>
        </aside>

        {{-- Primary Content Column --}}
        <div class="flex-1 flex flex-col min-w-0">
            <header class="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-stone-200/90 px-4 lg:px-8 flex items-center justify-between gap-4">
                <form method="POST" action="{{ route('workspace.switch') }}" class="flex items-center gap-2">
                    @csrf
                    <select name="workspace" onchange="this.form.submit()"
                            class="h-9 pl-3 pr-8 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-400">
                        <option value="all" @selected(($workspace ?? 'all') === 'all')>All Alma Maters (Unified View)</option>
                        <option value="st-xaviers" @selected(($workspace ?? '') === 'st-xaviers')>St. Xavier's High School · Class of 2014</option>
                        <option value="nit-warangal" @selected(($workspace ?? '') === 'nit-warangal')>NIT Warangal · B.Tech CS 2018</option>
                        <option value="isb-hyderabad" @selected(($workspace ?? '') === 'isb-hyderabad')>ISB Hyderabad · MBA 2022</option>
                    </select>
                </form>

                <div class="flex items-center gap-3">
                    <button type="button" @click="dmDrawer = true"
                            class="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50">
                        Messages
                    </button>
                    <a href="{{ route('id-card') }}" class="flex items-center gap-2.5 pl-2">
                        <span class="w-8 h-8 rounded-full bg-stone-900 text-white text-xs font-semibold flex items-center justify-center">RS</span>
                        <span class="hidden sm:inline text-xs font-semibold text-stone-900">Rohan Sharma</span>
                    </a>
                </div>
            </header>

            <main class="flex-1 w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
                @if (session('status'))
                    <div class="mb-5 px-4 py-3 rounded-xl bg-stone-900 text-white text-xs font-medium">
                        {{ session('status') }}
                    </div>
                @endif

                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
