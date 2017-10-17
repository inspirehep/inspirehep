import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JsonEditorWrapperComponent } from './record-editor/json-editor-wrapper';
import { HoldingpenEditorComponent } from './holdingpen-editor/holdingpen-editor.component';

const appRoutes: Routes = [
  { path: 'holdingpen/:objectid', component: HoldingpenEditorComponent },
  { path: ':type/:recid', component: JsonEditorWrapperComponent }
];

export const appRoutingProviders: Array<any> = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

