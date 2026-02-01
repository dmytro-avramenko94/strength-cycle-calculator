import { Routes } from "@angular/router";
import { CreateCycleComponent } from "./app/create-cycle/create-cycle.component";
import { ProgramComponent } from "./app/program/program.component";

export const routeConfig: Routes = [
    {
        path: 'create',
        component: CreateCycleComponent,
        title: 'Create New Cycle'
    },
    {
        path: 'program/:id',
        component: ProgramComponent,
        title: 'Program Page'
    },
]