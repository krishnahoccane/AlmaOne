<?php

use App\Http\Controllers\AlumniPortalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AlmaOne Multi-Tenant Alumni Network Routes ("1 App, 1 User")
|--------------------------------------------------------------------------
*/

Route::middleware(['web'])->group(function () {
    // Workspace Switching & Add Alma Mater Verification
    Route::post('/workspace/switch', [AlumniPortalController::class, 'switchWorkspace'])->name('workspace.switch');
    Route::post('/institutions/verify', [AlumniPortalController::class, 'verifyAndAttachInstitution'])->name('institutions.verify');
    Route::patch('/profile/privacy', [AlumniPortalController::class, 'updatePrivacy'])->name('profile.privacy');

    // Core 10 Member & Institutional Views
    Route::get('/', [AlumniPortalController::class, 'feed'])->name('feed');
    Route::post('/posts', [AlumniPortalController::class, 'storePost'])->name('posts.store');
    Route::post('/posts/{post}/like', [AlumniPortalController::class, 'toggleLike'])->name('posts.like');
    Route::post('/posts/{post}/poll-vote', [AlumniPortalController::class, 'votePoll'])->name('posts.vote');
    Route::post('/posts/{post}/comments', [AlumniPortalController::class, 'storeComment'])->name('posts.comment');

    Route::get('/directory', [AlumniPortalController::class, 'directory'])->name('directory');
    Route::post('/alumni/{alumnus}/connect', [AlumniPortalController::class, 'toggleConnect'])->name('alumni.connect');

    Route::get('/groups', [AlumniPortalController::class, 'groups'])->name('groups');
    Route::get('/groups/{group}', [AlumniPortalController::class, 'showGroup'])->name('groups.show');
    Route::post('/groups/{group}/join', [AlumniPortalController::class, 'toggleJoinGroup'])->name('groups.join');

    Route::get('/jobs', [AlumniPortalController::class, 'jobs'])->name('jobs');
    Route::post('/jobs', [AlumniPortalController::class, 'storeJob'])->name('jobs.store');
    Route::post('/jobs/{job}/referral', [AlumniPortalController::class, 'requestReferral'])->name('jobs.referral');

    Route::get('/mentorship', [AlumniPortalController::class, 'mentorship'])->name('mentorship');
    Route::post('/mentorship/book', [AlumniPortalController::class, 'bookMentorship'])->name('mentorship.book');

    Route::get('/events', [AlumniPortalController::class, 'events'])->name('events');
    Route::post('/events/{event}/rsvp', [AlumniPortalController::class, 'rsvpEvent'])->name('events.rsvp');
    Route::get('/events/{event}/calendar.ics', [AlumniPortalController::class, 'downloadIcs'])->name('events.ics');

    Route::get('/businesses', [AlumniPortalController::class, 'businesses'])->name('businesses');
    Route::post('/businesses', [AlumniPortalController::class, 'storeBusiness'])->name('businesses.store');

    Route::get('/giving', [AlumniPortalController::class, 'giving'])->name('giving');
    Route::post('/giving/donate', [AlumniPortalController::class, 'storeDonation'])->name('giving.donate');

    Route::get('/id-card', [AlumniPortalController::class, 'digitalId'])->name('id-card');

    // Institutional B2B Admin Portal
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AlumniPortalController::class, 'adminPortal'])->name('index');
        Route::post('/verifications/{request}/approve', [AlumniPortalController::class, 'approveVerification'])->name('verifications.approve');
        Route::post('/verifications/{request}/reject', [AlumniPortalController::class, 'rejectVerification'])->name('verifications.reject');
        Route::post('/broadcasts', [AlumniPortalController::class, 'sendBroadcast'])->name('broadcasts.send');
    });
});
