import { RouterConfig, provideRouter } from '@angular/router';
import { EditorContainerComponent } from './editor-container';

export const routes: RouterConfig = [
  { path: 'edit', component: EditorContainerComponent }
];

export const appRouterProviders = [
  provideRouter(routes)
];
