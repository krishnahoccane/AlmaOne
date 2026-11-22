<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'company',
        'city',
        'country',
        'bio',
        'privacy_settings',
        'open_to',
    ];

    protected $casts = [
        'privacy_settings' => 'array',
        'open_to' => 'array',
    ];

    public function institutions(): BelongsToMany
    {
        return $this->belongsToMany(Institution::class, 'institution_user')
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
