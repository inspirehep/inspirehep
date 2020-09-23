import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const appRoutes: Routes = [
  {
    path: 'holdingpen',
    loadChildren:
      './holdingpen-editor/holdingpen-editor.module#HoldingpenEditorModule',
  },
  {
    path: 'record',
    loadChildren: './record-editor/record-editor.module#RecordEditorModule',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRouter {}
