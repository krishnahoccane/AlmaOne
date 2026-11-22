@extends('layouts.app')

@section('title', 'Digital Alumni ID · AlmaOne')

@section('content')
<div class="space-y-6" x-data="{ flipped: false }">
    <div>
        <h1 class="font-serif text-3xl font-semibold text-stone-900 tracking-tight">Digital Alumni ID Card</h1>
        <p class="text-sm text-stone-500 mt-1">Click your card to flip between verified academic credentials and your dynamic campus QR pass.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-8 flex flex-col items-center gap-5">
            <div class="w-full max-w-[440px] perspective-1200">
                <div @click="flipped = !flipped" :class="{ 'rotate-y-180': flipped }"
                     class="relative w-full aspect-[1.58/1] min-h-[268px] cursor-pointer preserve-3d transition-transform duration-500">
                    <div class="absolute inset-0 backface-hidden rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between bg-gradient-to-br from-emerald-900 to-slate-900">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="font-serif text-lg font-semibold">NIT Warangal</div>
                                <div class="text-[11px] text-white/75">Official Verified Alumni Credential</div>
                            </div>
                            <span class="text-xs text-emerald-200 font-medium">Verified</span>
                        </div>
                        <div>
                            <div class="font-serif text-xl font-semibold">Rohan Sharma</div>
                            <div class="text-xs text-white/85">B.Tech Computer Science · Class of 2018</div>
                        </div>
                        <div class="pt-3 border-t border-white/20 flex justify-between font-mono text-xs tabular-nums">
                            <span>14CS1048</span>
                            <span>NITW-18-CS048</span>
                        </div>
                    </div>
                    <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6 bg-white border border-stone-300 shadow-lg flex flex-col justify-between">
                        <div class="text-xs font-semibold text-stone-900">Campus Gate & Library QR Entry Pass</div>
                        <p class="text-xs text-stone-500">Present at NIT Warangal campus entry gates, central library, or alumni guest house.</p>
                        <div class="font-mono text-xs text-stone-700 border-t border-stone-100 pt-3">Access Code: NITW-18-CS048</div>
                    </div>
                </div>
            </div>
            <button type="button" @click="flipped = !flipped" class="px-4 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 hover:bg-stone-50">
                Flip ID Card
            </button>
        </div>

        <form method="POST" action="{{ route('profile.privacy') }}" class="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            @csrf
            @method('PATCH')
            <h2 class="text-sm font-semibold text-stone-900">Granular Privacy Controls</h2>
            <label class="flex items-center justify-between text-xs text-stone-700">
                <span>Display Personal Email</span>
                <input type="checkbox" name="show_email" checked class="rounded border-stone-300" />
            </label>
            <label class="flex items-center justify-between text-xs text-stone-700">
                <span>Display Phone Number</span>
                <input type="checkbox" name="show_phone" class="rounded border-stone-300" />
            </label>
            <label class="flex items-center justify-between text-xs text-stone-700">
                <span>Display Current Employer</span>
                <input type="checkbox" name="show_company" checked class="rounded border-stone-300" />
            </label>
            <button type="submit" class="w-full py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold">
                Save Privacy Preferences
            </button>
        </form>
    </div>
</div>
@endsection
