<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::component('main-layout', \App\View\Components\Layouts\Main::class);
        Blade::component('main-header', \App\View\Components\Headers\Main::class);
        Blade::component('main-footer', \App\View\Components\Footers\Main::class);

        Blade::component('form', \App\View\Components\Forms\Form::class);
    }
}