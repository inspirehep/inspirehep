import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditorContainerComponent } from './editor-container';

const appRoutes: Routes = [
  { path: ':type/:recid', component: EditorContainerComponent }
];

export const appRoutingProviders: Array<any> = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

