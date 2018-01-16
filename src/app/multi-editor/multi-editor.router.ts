import { Routes, RouterModule } from '@angular/router';
import { MultiEditorComponent } from './multi-editor.component';

const multiEditorRoutes: Routes = [
  { path: 'edit', component: MultiEditorComponent }
];

export const multiEditorRouter = RouterModule.forChild(multiEditorRoutes);
