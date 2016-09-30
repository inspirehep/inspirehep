import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { JsonEditorModule } from 'ng2-json-editor/ng2-json-editor';

import { AppComponent } from './app.component';
import { EditorContainerComponent } from './editor-container';

import { routing, appRoutingProviders, } from './app.routing';

import { SHARED_PIPES, SHARED_SERVICES } from './shared';

@NgModule({
  declarations: [
    AppComponent,
    EditorContainerComponent,
    ...SHARED_PIPES
  ],
  imports: [
    BrowserModule,
    HttpModule,
    routing,
    JsonEditorModule
  ],
  providers: [
    ...appRoutingProviders,
    ...SHARED_SERVICES
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
