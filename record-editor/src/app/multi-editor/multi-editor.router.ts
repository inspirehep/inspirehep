import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { MultiEditorComponent } from './multi-editor.component';

const multiEditorRoutes: Routes = [
  { path: '', component: MultiEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(multiEditorRoutes)],
  exports: [RouterModule],
})
export class MultiEditorRouter {}
