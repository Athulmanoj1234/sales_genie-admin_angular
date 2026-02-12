import { Routes } from '@angular/router';
import { App } from './app';
import { Main } from './shared/main/main';

export const routes: Routes = [
    {
        path: "",
        // pathMatch: 'full',
        // loadComponent: () => { return import('./features/components/home/home').then(component => component.Home) }
        component: Main,
        children: [
            {
                path: "",
                loadComponent: () => { return import('./features/components/home/home').then(component => component.Home) }
            }
        ]
    },
    {
        path: "auth/register",
        loadComponent: () => { return import('./features/auth/register/register').then(component => component.Register) }
    },
    {
        path: "auth/login",
        loadComponent: () => { return import('./features/auth/login/login').then(component => component.Login) }
    },
];
