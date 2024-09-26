import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { BackofficeEditorComponent } from './backoffice-editor.component';

const backofficeEditorRoutes: Routes = [
  { path: ':uuid', component: BackofficeEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(backofficeEditorRoutes)],
  exports: [RouterModule],
})
export class BackofficeEditorRouter {}
