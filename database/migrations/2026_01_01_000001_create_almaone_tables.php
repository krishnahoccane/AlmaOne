<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('short_name');
            $table->string('type'); // High School, Engineering Institute, Business School, University
            $table->string('location');
            $table->unsignedSmallInteger('founded_year');
            $table->string('motto')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('crest_variant')->default('columns');
            $table->json('theme_tokens');
            $table->unsignedInteger('verified_count')->default(0);
            $table->unsignedTinyInteger('active_batch_rate')->default(0);
            $table->timestamps();
        });

        // "1 App, 1 User" Pivot: Links a single User to multiple verified Institutions
        Schema::create('institution_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('degree');
            $table->string('department');
            $table->unsignedSmallInteger('batch_year');
            $table->string('roll_number');
            $table->string('verification_method'); // Official Email, Roll Number Registry, Peer Vouched
            $table->string('campus_access_code')->unique();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'institution_id', 'batch_year']);
        });

        Schema::create('feed_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('update'); // announcement, milestone, update, question, poll
            $table->string('milestone_label')->nullable();
            $table->string('title')->nullable();
            $table->text('content');
            $table->json('poll_payload')->nullable();
            $table->boolean('is_official_broadcast')->default(false);
            $table->string('broadcast_segment')->nullable();
            $table->timestamps();
        });

        Schema::create('alumni_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('category'); // batch, regional, club
            $table->text('description');
            $table->string('lead_name');
            $table->string('location_or_year');
            $table->timestamps();
        });

        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('posted_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company');
            $table->string('location');
            $table->string('work_mode'); // Hybrid, On-site, Remote
            $table->string('employment_type');
            $table->string('experience_level');
            $table->string('compensation');
            $table->boolean('direct_referral')->default(true);
            $table->text('description');
            $table->json('requirements')->nullable();
            $table->timestamps();
        });

        Schema::create('alumni_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('category'); // Milestone Reunion, City Meetup, Virtual Webinar
            $table->date('event_date');
            $table->string('time_display');
            $table->string('location');
            $table->boolean('is_virtual')->default(false);
            $table->string('price_display')->default('Free');
            $table->unsignedInteger('capacity')->default(200);
            $table->text('description');
            $table->timestamps();
        });

        Schema::create('event_rsvps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('qr_pass_code')->unique();
            $table->timestamps();
            $table->unique(['alumni_event_id', 'user_id']);
        });

        Schema::create('fundraising_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('category');
            $table->unsignedBigInteger('goal_amount_inr');
            $table->unsignedBigInteger('raised_amount_inr')->default(0);
            $table->unsignedInteger('donor_count')->default(0);
            $table->text('summary');
            $table->timestamps();
        });

        Schema::create('verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('applicant_name');
            $table->string('email');
            $table->string('claimed_degree');
            $table->string('claimed_department');
            $table->unsignedSmallInteger('claimed_batch');
            $table->string('roll_number');
            $table->string('roll_match_status'); // Exact Match, Partial Match, Manual Review
            $table->unsignedTinyInteger('peer_vouches')->default(0);
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_requests');
        Schema::dropIfExists('fundraising_campaigns');
        Schema::dropIfExists('event_rsvps');
        Schema::dropIfExists('alumni_events');
        Schema::dropIfExists('job_listings');
        Schema::dropIfExists('alumni_groups');
        Schema::dropIfExists('feed_posts');
        Schema::dropIfExists('institution_user');
        Schema::dropIfExists('institutions');
    }
};
