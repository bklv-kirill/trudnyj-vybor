<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AuthRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __invoke(AuthRequest $request): RedirectResponse
    {
        $userData = $request->validated();

        if (Auth::attempt([
            'email' => $userData['email'],
            'password' => $userData['password']
        ], isset($userData['remember_me']))) {
            $request->session()->regenerate();

            return redirect()->route('main');
        }

        return back()->withErrors([
            'password' => 'Неверный пароль.',
        ])->onlyInput('password');
    }
}