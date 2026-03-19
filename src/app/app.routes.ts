import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Pokemon } from './pokemon/pokemon';

export const routes: Routes = [
    {
        path: "",
        component: Home
    },
    {
        path: "pokemon/:id",
        component: Pokemon
    },
    {
        path: "**",
        pathMatch: "full",
        redirectTo: ""
    }
];
