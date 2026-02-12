import { Routes } from "@angular/router";
import { CreateCycleComponent } from "./app/create-cycle/create-cycle.component";
import { ProgramComponent } from "./app/program/program.component";
import { ProgramsListComponent } from "./app/programs-list/programs-list.component";

export const routeConfig: Routes = [
    {
        path: 'create',
        component: CreateCycleComponent,
        title: 'Create New Cycle'
    },
    // {
    //     path: 'program/:id',
    //     component: ProgramComponent,
    //     title: 'Program Page'
    // },
    {
        path: 'programs',
        component: ProgramsListComponent,
        title: 'Programs List'
    },
]