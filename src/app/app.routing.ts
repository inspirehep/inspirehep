import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditorContainerComponent } from './editor-container';
import { EditorHoldingPenComponent } from './editor-holdingpen';

const appRoutes: Routes = [
  { path: 'holdingpen/:objectid', component: EditorHoldingPenComponent },
  { path: ':type/:recid', component: EditorContainerComponent }
];

export const appRoutingProviders: Array<any> = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

