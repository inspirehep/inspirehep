/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

import { EditorComponent } from './editor';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  pipes: [],
  providers: [],
  directives: [EditorComponent],
  encapsulation: ViewEncapsulation.None, // Apply style (bootstrap.scss) to all children
  styles: [
    require('./app.component.scss')
  ],
  template: require('./app.component.html')
})
export class App {
  constructor() {
  }
}