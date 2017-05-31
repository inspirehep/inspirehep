import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';

import { JsonEditorModule } from 'ng2-json-editor';

import { AppComponent } from './app.component';
import { EditorHoldingPenComponent } from './editor-holdingpen';
import { EditorContainerComponent } from './editor-container';
import { EditorToolbarComponent, EditorToolbarSaveComponent } from './editor-toolbar';
import { EditorHoldingPenToolbarComponent, EditorHoldingPenToolbarSaveComponent } from './editor-holdingpen-toolbar';

import { routing, appRoutingProviders, } from './app.routing';

import { SHARED_PIPES, SHARED_SERVICES } from './shared';

@NgModule({
  declarations: [
    AppComponent,
    EditorHoldingPenComponent,
    EditorHoldingPenToolbarComponent,
    EditorHoldingPenToolbarSaveComponent,
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
    { provide: APP_BASE_HREF, useValue: '/editor' },
    ...appRoutingProviders,
    ...SHARED_SERVICES
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
