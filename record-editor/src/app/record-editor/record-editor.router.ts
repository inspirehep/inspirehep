import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RecordSearchComponent } from './record-search';
import { JsonEditorWrapperComponent } from './json-editor-wrapper';


const recordEditorRoutes: Routes = [
  { path: ':type/search', component: RecordSearchComponent },
  { path: ':type/:recid', component: JsonEditorWrapperComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(recordEditorRoutes)
  ],
  exports: [
    RouterModule,
  ]
})
export class RecordEditorRouter { }
