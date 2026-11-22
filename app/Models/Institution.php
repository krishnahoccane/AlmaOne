<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Institution extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'short_name',
        'type',
        'location',
        'founded_year',
        'motto',
        'banner_url',
        'crest_variant',
        'theme_tokens',
        'verified_count',
        'active_batch_rate',
    ];

    protected $casts = [
        'theme_tokens' => 'array',
    ];

    public function alumni(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'institution_user')
            ->withPivot([
                'degree',
                'department',
                'batch_year',
                'roll_number',
                'verification_method',
                'campus_access_code',
                'verified_at',
            ])
            ->withTimestamps();
    }
}
