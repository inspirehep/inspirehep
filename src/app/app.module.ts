import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {APP_BASE_HREF} from '@angular/common';
import { HttpModule } from '@angular/http';

import { JsonEditorModule } from 'ng2-json-editor/ng2-json-editor';

import { AppComponent } from './app.component';
import { EditorContainerComponent } from './editor-container';
import { EditorToolbarComponent, EditorToolbarSaveComponent } from './editor-toolbar';

import { routing, appRoutingProviders, } from './app.routing';

import { SHARED_PIPES, SHARED_SERVICES } from './shared';
import { APP_CONFIG, INSPIRE_EDITOR_CONFIG } from './app.config';

@NgModule({
  declarations: [
    AppComponent,
    EditorToolbarComponent,
    EditorContainerComponent,
    EditorToolbarSaveComponent,
    ...SHARED_PIPES
  ],
  imports: [
    BrowserModule,
    HttpModule,
    routing,
    JsonEditorModule
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: '/editor'},
    {provide: APP_CONFIG, useValue: INSPIRE_EDITOR_CONFIG },
    ...appRoutingProviders,
    ...SHARED_SERVICES
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
