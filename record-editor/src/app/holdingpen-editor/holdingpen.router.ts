import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HoldingpenEditorComponent } from './holdingpen-editor.component';

const holdingpenEditorRoutes: Routes = [
  { path: ':objectid', component: HoldingpenEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(holdingpenEditorRoutes)],
  exports: [RouterModule],
})
export class HoldingpenEditorRouter {}
