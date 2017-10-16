import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditorContainerComponent } from './record-editor/editor-container';
import { HoldingpenEditorComponent } from './holdingpen-editor/holdingpen-editor.component';

const appRoutes: Routes = [
  { path: 'holdingpen/:objectid', component: HoldingpenEditorComponent },
  { path: ':type/:recid', component: EditorContainerComponent }
];

export const appRoutingProviders: Array<any> = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

